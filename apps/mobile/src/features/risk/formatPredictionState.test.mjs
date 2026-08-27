import assert from "node:assert/strict";
import test from "node:test";

import { buildPredictionPresentation, formatPredictionState } from "./predictionPresentation.mjs";

test("keeps insufficient data distinct from risk levels", () => {
  const prediction = predictionDto({ status: "INSUFFICIENT_DATA", risk: null, required_fields: ["sleep_quality"] });

  assert.equal(formatPredictionState(prediction), "insufficient_data");
  const presentation = buildPredictionPresentation({ childId: "child-1", prediction });

  assert.equal(presentation.state, "insufficient_data");
  assert.equal(presentation.title, "Información insuficiente");
  assert.equal(presentation.riskLevel, null);
  assert.equal(presentation.riskLabel, null);
  assert.equal(presentation.riskScoreLabel, null);
  assert.equal(presentation.confidenceLabel, "Alta");
  assert.equal(presentation.horizonLabel, "Riesgo preventivo para las próximas 24 horas");
  assert.deepEqual(presentation.missingFieldLabels, ["Sueño"]);
  assert.equal(presentation.disclaimer, "Indicador preventivo demostrativo. No corresponde a un diagnóstico.");
  assert.equal(typeof presentation.updatedAtLabel, "string");
});

test("maps calculated risk levels without thresholds", () => {
  for (const level of ["LOW", "MEDIUM", "HIGH"]) {
    const prediction = predictionDto({ risk: { score: 0.5, level } });
    const presentation = buildPredictionPresentation({ childId: "child-1", prediction });

    assert.equal(formatPredictionState(prediction), level);
    assert.equal(presentation.state, "risk");
    assert.equal(presentation.riskLevel, level);
    assert.equal(["Bajo", "Medio", "Alto"].includes(presentation.riskLabel), true);
  }
});

test("preserves low confidence, top factors, and synthetic indicator", () => {
  const prediction = predictionDto({
    status: "LOW_CONFIDENCE",
    top_factors: [
      { code: "ROUTINE_CHANGE", label: "Cambio de rutina" },
      { code: "SLEEP_ALTERED_3D", label: "Sueño alterado" },
    ],
    data_quality: { contains_synthetic_data: true },
  });

  const presentation = buildPredictionPresentation({ childId: "child-1", prediction });

  assert.equal(presentation.state, "low_confidence");
  assert.deepEqual(presentation.factorCodes, ["ROUTINE_CHANGE", "SLEEP_ALTERED_3D"]);
  assert.deepEqual(presentation.factorLabels, ["Cambio de rutina", "Sueño alterado"]);
  assert.equal(presentation.containsSyntheticData, true);
  assert.equal(presentation.limitedEvidenceMessage, "Esta estimación utiliza evidencia limitada.");
});

test("covers loading, error, and empty presentation states", () => {
  assert.equal(buildPredictionPresentation({ loading: true }).state, "loading");
  assert.equal(buildPredictionPresentation({ error: true }).state, "error");
  assert.equal(buildPredictionPresentation({ childId: null }).state, "empty_no_child");
  assert.equal(buildPredictionPresentation({ childId: "child-1", prediction: null }).state, "empty_no_prediction");
});

function predictionDto(overrides = {}) {
  return {
    status: "OK",
    risk: { score: 0.1, level: "LOW" },
    confidence: { score: 0.8, level: "HIGH" },
    top_factors: [],
    prediction_at: "2026-08-26T12:00:00+00:00",
    horizon_hours: 24,
    data_quality: {
      contains_synthetic_data: false,
      ...(overrides.data_quality ?? {}),
    },
    required_fields: [],
    ...overrides,
  };
}
