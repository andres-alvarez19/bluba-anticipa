import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { createApiClient, type ChildSummary, type RiskPrediction } from "@bluba/api-client";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [child, setChild] = useState<ChildSummary | null>(null);
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);

  const api = useMemo(() => (apiUrl ? createApiClient({ baseUrl: apiUrl }) : null), []);

  const refresh = useCallback(async () => {
    if (!api) {
      setError("Configura EXPO_PUBLIC_API_URL para conectar con el backend.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const session = await api.createDemoSession("FAMILY");
      setSessionReady(session.role === "FAMILY");

      const children = await api.listAuthorizedChildren();
      const firstChild = children[0] ?? null;
      setChild(firstChild);
      setPrediction(firstChild ? await api.getCurrentRiskPrediction(firstChild.id) : null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo conectar con la API.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  const registerDemoDay = useCallback(async () => {
    if (!api || !child) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await api.createDailyRecord(child.id, {
        recorded_at: new Date().toISOString(),
        source: "FAMILY",
        context: "HOME",
        features: {
          sleep_quality: null,
          sleep_hours: null,
          wake_state: "desconocido",
          regulation_level: null,
          alert_level: "desconocido",
          routine_change: null,
          gastrointestinal_status: null,
          observed_behavior: [],
          exceptional_event: null,
          sensory_profile: []
        },
        notes: "Registro demo con datos criticos faltantes."
      });
      setPrediction(await api.getCurrentRiskPrediction(child.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo registrar el dia demo.");
    } finally {
      setSaving(false);
    }
  }, [api, child]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Bluba Anticipa - Integration Demo</Text>

      <Section title="Sesion">
        <Text style={styles.value}>{sessionReady ? "FAMILY ok" : "Sin sesion"}</Text>
      </Section>

      <Section title="Nino">
        <Text style={styles.value}>{child?.display_name ?? "Sin nino demo disponible"}</Text>
      </Section>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator color="#1f6f62" /> : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={loading || saving || !child}
          onPress={registerDemoDay}
          style={({ pressed }) => [styles.button, (pressed || saving || !child) && styles.buttonMuted]}
        >
          <Text style={styles.buttonText}>{saving ? "Registrando..." : "Registrar dia demo"}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={loading || saving}
          onPress={refresh}
          style={({ pressed }) => [styles.buttonSecondary, (pressed || loading) && styles.buttonSecondaryMuted]}
        >
          <Text style={styles.buttonSecondaryText}>Actualizar</Text>
        </Pressable>
      </View>

      <Section title="Estado preventivo">
        {prediction ? <PredictionDetails prediction={prediction} /> : <Text style={styles.empty}>Sin prediccion cargada.</Text>}
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{title}</Text>
      {children}
    </View>
  );
}

function PredictionDetails({ prediction }: { prediction: RiskPrediction }) {
  const missingLabels = prediction.data_quality.missing_critical_data.length > 0
    ? prediction.data_quality.missing_critical_data.map((item) => labelForField(item.field))
    : prediction.data_quality.missing_fields.map(labelForField);

  return (
    <View style={styles.prediction}>
      <Text style={styles.status}>Estado de hoy</Text>
      {prediction.status === "INSUFFICIENT_DATA" ? (
        <Text style={styles.valueStrong}>Datos insuficientes para estimar riesgo</Text>
      ) : null}
      {prediction.risk ? (
        <>
          <Text style={styles.label}>Riesgo</Text>
          <Text style={styles.valueStrong}>{prediction.risk.level}</Text>
          <Text style={styles.value}>Indice demostrativo {prediction.risk.score}</Text>
        </>
      ) : null}
      <Text style={styles.label}>Confianza</Text>
      <Text style={styles.valueStrong}>{prediction.confidence.level}</Text>
      {prediction.top_factors.length > 0 ? (
        <>
          <Text style={styles.label}>Principales factores</Text>
          {prediction.top_factors.map((factor) => (
            <Text key={factor.code} style={styles.listItem}>
              - {factor.label}
            </Text>
          ))}
        </>
      ) : null}
      {missingLabels.length > 0 ? (
        <>
          <Text style={styles.label}>Falta registrar</Text>
          {missingLabels.map((field, index) => (
            <Text key={`${field}-${index}`} style={styles.listItem}>
              - {field}
            </Text>
          ))}
        </>
      ) : null}
    </View>
  );
}

function labelForField(field: string) {
  const labels: Record<string, string> = {
    sleep: "Sueño",
    sleep_quality: "Sueño",
    sleep_hours: "Sueño",
    wake_state: "Estado al despertar",
    regulation_level: "Regulación o conducta",
    observed_behavior: "Regulación o conducta"
  };
  return labels[field] ?? field;
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    gap: 18,
    padding: 24,
    backgroundColor: "#f7faf9"
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#18332f"
  },
  section: {
    gap: 6
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#47615d",
    textTransform: "uppercase"
  },
  value: {
    fontSize: 16,
    color: "#18332f"
  },
  valueStrong: {
    fontSize: 18,
    fontWeight: "700",
    color: "#18332f"
  },
  status: {
    fontSize: 20,
    fontWeight: "700",
    color: "#18332f"
  },
  empty: {
    fontSize: 16,
    color: "#6b7f7b"
  },
  error: {
    borderLeftWidth: 4,
    borderLeftColor: "#b42318",
    paddingLeft: 12,
    color: "#7a271a"
  },
  actions: {
    gap: 10
  },
  button: {
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: "#1f6f62"
  },
  buttonMuted: {
    opacity: 0.55
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff"
  },
  buttonSecondary: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f6f62",
    paddingVertical: 14
  },
  buttonSecondaryMuted: {
    opacity: 0.55
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f6f62"
  },
  prediction: {
    gap: 8
  },
  listItem: {
    fontSize: 15,
    color: "#18332f"
  }
});
