import type { Prediction } from "@bluba/shared-types";

export function formatPredictionState(prediction: Prediction): string {
  if (prediction.status === "insufficient_data") {
    return "insufficient_data";
  }
  return prediction.risk.level;
}
