import type { RiskPrediction } from "@bluba/api-client";
import {
  buildPredictionPresentation as buildPredictionPresentationImpl,
  formatPredictionState as formatPredictionStateImpl,
} from "./predictionPresentation.mjs";

export type RiskPresentation =
  | { state: "loading"; title: string }
  | { state: "error"; title: string }
  | { state: "empty_no_child"; title: string }
  | { state: "empty_no_prediction"; title: string }
  | (RiskResultPresentationBase & { state: "risk" })
  | (RiskResultPresentationBase & { state: "low_confidence" })
  | (RiskResultPresentationBase & { state: "insufficient_data" });

export type RiskResultPresentationBase = {
  title: string;
  riskLevel: string | null;
  riskLabel: string | null;
  riskScoreLabel: string | null;
  confidenceLevel: string;
  confidenceLabel: string;
  horizonLabel: string;
  factorCodes: string[];
  factorLabels: string[];
  missingFields: string[];
  missingFieldLabels: string[];
  containsSyntheticData: boolean;
  updatedAtLabel: string;
  disclaimer: string;
  limitedEvidenceMessage: string | null;
};

export function formatPredictionState(prediction: RiskPrediction): string {
  return formatPredictionStateImpl(prediction);
}

export function buildPredictionPresentation(input: {
  loading?: boolean;
  error?: boolean;
  childId?: string | null;
  prediction?: RiskPrediction | null;
}): RiskPresentation {
  return buildPredictionPresentationImpl(input) as RiskPresentation;
}
