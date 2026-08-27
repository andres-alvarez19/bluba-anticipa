import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { createApiClient, type ChildSummary, type RiskPrediction } from "@bluba/api-client";

import { buildPredictionPresentation } from "../src/features/risk/formatPredictionState";
import { MissingDataCard } from "../src/features/risk/MissingDataCard";
import { PredictionCard } from "../src/features/risk/PredictionCard";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const demoToolsEnabled = process.env.EXPO_PUBLIC_DEMO_TOOLS === "true";

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      await api.createDemoSession("FAMILY");
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
          sensory_profile: [],
        },
        notes: "Registro demo con datos criticos faltantes.",
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

  const presentation = buildPredictionPresentation({
    loading,
    error: Boolean(error),
    childId: child?.id,
    prediction,
  });

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.brand}>Bluba Anticipa</Text>
        <Text style={styles.childName}>{child?.display_name ?? "Sin niño seleccionado"}</Text>
        <Text style={styles.title}>Estado de hoy</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={refresh}
        style={({ pressed }) => [styles.primaryButton, (pressed || loading) && styles.buttonMuted]}
      >
        <Text style={styles.primaryButtonText}>{loading ? "Consultando..." : "Ver estado de hoy"}</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {presentation.state === "loading" ? <ActivityIndicator color="#1f6f62" /> : null}
      {presentation.state === "empty_no_child" ? <Text style={styles.empty}>No hay niños autorizados para esta sesión.</Text> : null}
      {presentation.state === "empty_no_prediction" ? <Text style={styles.empty}>Sin predicción cargada.</Text> : null}

      {presentation.state === "insufficient_data" ? <MissingDataCard presentation={presentation} /> : null}
      {presentation.state === "risk" || presentation.state === "low_confidence" ? (
        <PredictionCard presentation={presentation} />
      ) : null}

      {prediction && "updatedAtLabel" in presentation ? <Text style={styles.updated}>Actualizado {presentation.updatedAtLabel}</Text> : null}
      <Text style={styles.disclaimer}>
        {prediction && "disclaimer" in presentation
          ? presentation.disclaimer
          : "Indicador preventivo demostrativo. No corresponde a un diagnóstico."}
      </Text>

      {demoToolsEnabled ? (
        <Pressable
          accessibilityRole="button"
          disabled={loading || saving || !child}
          onPress={registerDemoDay}
          style={({ pressed }) => [styles.devButton, (pressed || saving || !child) && styles.buttonMuted]}
        >
          <Text style={styles.devButtonText}>{saving ? "Registrando..." : "Registrar día demo"}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    gap: 22,
    padding: 24,
    backgroundColor: "#f7faf9",
  },
  header: {
    gap: 8,
  },
  brand: {
    color: "#18332f",
    fontSize: 18,
    fontWeight: "800",
  },
  childName: {
    color: "#52635f",
    fontSize: 16,
  },
  title: {
    color: "#18332f",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#1f6f62",
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonMuted: {
    opacity: 0.55,
  },
  error: {
    borderLeftWidth: 4,
    borderLeftColor: "#b42318",
    color: "#7a271a",
    paddingLeft: 12,
  },
  empty: {
    color: "#52635f",
    fontSize: 16,
  },
  updated: {
    color: "#52635f",
    fontSize: 14,
  },
  disclaimer: {
    color: "#18332f",
    fontSize: 13,
    lineHeight: 18,
  },
  devButton: {
    alignItems: "center",
    borderColor: "#52635f",
    borderWidth: 1,
    paddingVertical: 12,
  },
  devButtonText: {
    color: "#52635f",
    fontSize: 14,
    fontWeight: "700",
  },
});
