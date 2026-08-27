import type { RiskPresentation } from "./formatPredictionState";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  presentation: RiskPresentation & { state: "insufficient_data" };
};

export function MissingDataCard({ presentation }: Props) {
  return (
    <View style={styles.section}>
      {presentation.containsSyntheticData ? <Text style={styles.badge}>Datos de demostración</Text> : null}
      <Text style={styles.message}>Aún no hay información suficiente para estimar el riesgo.</Text>
      <View style={styles.metricRow}>
        <Text style={styles.label}>Confianza</Text>
        <Text style={styles.confidence}>{presentation.confidenceLabel}</Text>
      </View>
      {presentation.missingFieldLabels.length > 0 ? (
        <View style={styles.list}>
          <Text style={styles.label}>Para mejorar la estimación falta registrar:</Text>
          {presentation.missingFieldLabels.map((label, index) => (
            <Text key={`${label}-${index}`} style={styles.item}>
              • {label}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#9a6b12",
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: "#704b08",
    fontSize: 12,
    fontWeight: "700",
  },
  message: {
    color: "#18332f",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  label: {
    color: "#52635f",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  confidence: {
    color: "#18332f",
    fontSize: 18,
    fontWeight: "700",
  },
  list: {
    gap: 6,
  },
  item: {
    color: "#18332f",
    fontSize: 15,
    lineHeight: 21,
  },
});
