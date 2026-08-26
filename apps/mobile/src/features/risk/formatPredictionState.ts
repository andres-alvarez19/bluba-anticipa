import type { RiskPrediction } from "@bluba/api-client";

export function formatPredictionState(prediction: RiskPrediction): string {
  if (prediction.status === "INSUFFICIENT_DATA") {
    return "insufficient_data";
  }
  return prediction.risk?.level ?? "unknown";
}
