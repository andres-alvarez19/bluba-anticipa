import type { RiskPrediction } from "@bluba/api-client";
import type { RiskPresentation } from "./formatPredictionState";

export function formatPredictionState(prediction: RiskPrediction): string;

export function buildPredictionPresentation(input: {
  loading?: boolean;
  error?: boolean;
  childId?: string | null;
  prediction?: RiskPrediction | null;
}): RiskPresentation;

export function riskLabel(level: string): string;

export function confidenceLabel(level: string): string;

export function fieldLabel(field: string): string;

export function formatLocalTime(value: string): string;
