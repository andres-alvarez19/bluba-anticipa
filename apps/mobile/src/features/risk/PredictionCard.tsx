import type { RiskPresentation } from "./formatPredictionState";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  presentation: RiskPresentation & { state: "risk" | "low_confidence" };
};

export function PredictionCard({ presentation }: Props) {
  return (
    <View style={styles.section}>
      {presentation.containsSyntheticData ? <Text style={styles.badge}>Datos de demostración</Text> : null}
      <Text style={styles.kicker}>{presentation.horizonLabel}</Text>
      <Text style={styles.label}>Riesgo</Text>
      <Text style={[styles.risk, riskColor(presentation.riskLevel)]}>{presentation.riskLabel}</Text>
      <Text style={styles.subtle}>Índice demostrativo {presentation.riskScoreLabel}</Text>

      <View style={styles.metricRow}>
        <Text style={styles.label}>Confianza</Text>
        <Text style={styles.confidence}>{presentation.confidenceLabel}</Text>
      </View>
      {presentation.limitedEvidenceMessage ? <Text style={styles.notice}>{presentation.limitedEvidenceMessage}</Text> : null}

      {presentation.factorLabels.length > 0 ? (
        <View style={styles.list}>
          <Text style={styles.label}>Principales factores</Text>
          {presentation.factorLabels.map((label, index) => (
            <Text key={`${label}-${index}`} style={styles.item}>
              • {label}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function riskColor(level: string | null) {
  if (level === "HIGH") {
    return styles.high;
  }
  if (level === "MEDIUM") {
    return styles.medium;
  }
  return styles.low;
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
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
  kicker: {
    color: "#52635f",
    fontSize: 14,
  },
  label: {
    color: "#52635f",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  risk: {
    fontSize: 44,
    fontWeight: "800",
    lineHeight: 50,
  },
  high: {
    color: "#a13d24",
  },
  medium: {
    color: "#8a6417",
  },
  low: {
    color: "#1f6f62",
  },
  subtle: {
    color: "#52635f",
    fontSize: 15,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  confidence: {
    color: "#18332f",
    fontSize: 18,
    fontWeight: "700",
  },
  notice: {
    borderLeftWidth: 4,
    borderLeftColor: "#8a6417",
    paddingLeft: 10,
    color: "#5b4618",
    fontSize: 15,
  },
  list: {
    gap: 6,
    paddingTop: 6,
  },
  item: {
    color: "#18332f",
    fontSize: 15,
    lineHeight: 21,
  },
});
