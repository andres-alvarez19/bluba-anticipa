export function formatPredictionState(prediction) {
  if (prediction.status === "INSUFFICIENT_DATA") {
    return "insufficient_data";
  }
  return prediction.risk?.level ?? "unknown";
}

export function buildPredictionPresentation(input) {
  if (input.loading) {
    return { state: "loading", title: "Cargando" };
  }
  if (input.error) {
    return { state: "error", title: "No se pudo cargar" };
  }
  if (!input.childId) {
    return { state: "empty_no_child", title: "Sin niño seleccionado" };
  }
  if (!input.prediction) {
    return { state: "empty_no_prediction", title: "Sin predicción" };
  }

  const prediction = input.prediction;
  const factorLabels = prediction.top_factors.map((factor) => factor.label).filter(Boolean);
  const missingFields =
    prediction.data_quality.missing_critical_data?.length > 0
      ? prediction.data_quality.missing_critical_data.map((item) => item.field)
      : prediction.required_fields;
  const state =
    prediction.status === "INSUFFICIENT_DATA"
      ? "insufficient_data"
      : prediction.status === "LOW_CONFIDENCE"
        ? "low_confidence"
        : "risk";

  return {
    state,
    title: state === "insufficient_data" ? "Información insuficiente" : prediction.risk?.level ?? "Riesgo no disponible",
    riskLevel: prediction.risk?.level ?? null,
    riskLabel: prediction.risk ? riskLabel(prediction.risk.level) : null,
    riskScoreLabel: prediction.risk ? prediction.risk.score.toFixed(2) : null,
    confidenceLevel: prediction.confidence.level,
    confidenceLabel: confidenceLabel(prediction.confidence.level),
    horizonLabel: `Riesgo preventivo para las próximas ${prediction.horizon_hours} horas`,
    factorCodes: prediction.top_factors.map((factor) => factor.code),
    factorLabels,
    missingFields,
    missingFieldLabels: missingFields.map(fieldLabel),
    containsSyntheticData: prediction.data_quality.contains_synthetic_data ?? false,
    updatedAtLabel: formatLocalTime(prediction.prediction_at),
    disclaimer: "Indicador preventivo demostrativo. No corresponde a un diagnóstico.",
    limitedEvidenceMessage: state === "low_confidence" ? "Esta estimación utiliza evidencia limitada." : null,
  };
}

export function riskLabel(level) {
  return { LOW: "Bajo", MEDIUM: "Medio", HIGH: "Alto" }[level] ?? level;
}

export function confidenceLabel(level) {
  return { LOW: "Baja", MEDIUM: "Media", HIGH: "Alta" }[level] ?? level;
}

export function fieldLabel(field) {
  const labels = {
    longitudinal_history: "Historial longitudinal",
    sleep: "Sueño",
    sleep_quality: "Sueño",
    sleep_hours: "Sueño",
    wake_state: "Estado al despertar",
    regulation_level: "Regulación o conducta",
    observed_behavior: "Regulación o conducta",
  };
  return labels[field] ?? field;
}

export function formatLocalTime(value) {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
