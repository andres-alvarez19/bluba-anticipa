from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

from .config import ModelConfig, load_model_config, resolve_confidence_level, resolve_risk_level
from .domain import PredictionEngineInput, PredictionEngineOutput, PredictionStatus


def predict(payload: PredictionEngineInput) -> PredictionEngineOutput:
    config = load_model_config()
    if payload.horizon_hours != config.horizon_hours:
        raise ValueError(f"horizon_hours must be {config.horizon_hours}")
    if not payload.child_id:
        raise ValueError("child_id is required")
    if not payload.prediction_at:
        raise ValueError("prediction_at is required")
    if not payload.features or not payload.derived or not payload.data_quality:
        raise ValueError("features, derived, and data_quality are required")

    prediction_at = _parse_datetime(payload.prediction_at)
    confidence_score = _confidence_score(payload.data_quality, config)
    confidence_level = resolve_confidence_level(confidence_score, config)
    confidence = {"score": confidence_score, "level": confidence_level.value}

    missing_critical = payload.data_quality.get("missing_critical_data") or []
    critical_present = payload.data_quality.get("critical_present")
    if critical_present is None:
        critical_present = max(0, config.minimum_data.critical_groups_total - len(missing_critical))
    risk_score, contributions = _risk_score(payload, config)
    required_fields = _required_fields(payload.data_quality)
    warnings: list[dict[str, Any]] = []

    valid_history_days = payload.data_quality.get("history_days") or 0
    baseline_available = valid_history_days >= config.windows.baseline_provisional_min_valid_days
    recent_trend_interpretable = payload.derived.get("regulation_trend_3d") is not None

    no_baseline_and_no_trend = not baseline_available and not recent_trend_interpretable

    if (
        critical_present < config.minimum_data.minimum_critical_groups_present
        or confidence_score < config.confidence_scoring.minimum_score_for_prediction
        or no_baseline_and_no_trend
    ):
        status = PredictionStatus.INSUFFICIENT_DATA
        risk = None
        top_factors: list[dict[str, Any]] = []
        if no_baseline_and_no_trend and not required_fields:
            required_fields = ["longitudinal_history"]
        warnings.append(
            {
                "code": "INSUFFICIENT_CRITICAL_DATA",
                "severity": "WARNING",
                "message": "No existe evidencia mínima suficiente para emitir una estimación de riesgo.",
            }
        )
    else:
        status = PredictionStatus.LOW_CONFIDENCE if confidence_level.value == "LOW" else PredictionStatus.OK
        risk = {"score": risk_score, "level": resolve_risk_level(risk_score, config).value}
        top_factors = _top_factors(contributions, payload, config)
        if status is PredictionStatus.LOW_CONFIDENCE:
            warnings.append(
                {
                    "code": "LOW_CONFIDENCE_ESTIMATE",
                    "severity": "INFO",
                    "message": "La estimación usa evidencia limitada; riesgo y confianza se reportan por separado.",
                }
            )

    return {
        "prediction_id": f"prediction-{uuid4()}",
        "child_id": payload.child_id,
        "prediction_at": prediction_at.isoformat(),
        "window_end_at": (prediction_at + timedelta(hours=payload.horizon_hours)).isoformat(),
        "horizon_hours": payload.horizon_hours,
        "model_version": config.model_version,
        "feature_schema_version": "features-mvp-v1",
        "status": status.value,
        "risk": risk,
        "confidence": confidence,
        "data_quality": payload.data_quality,
        "top_factors": top_factors,
        "warnings": warnings,
        "required_fields": required_fields,
    }


def _parse_datetime(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed


def _risk_score(payload: PredictionEngineInput, config: ModelConfig) -> tuple[float, dict[str, float]]:
    weights = config.risk_scoring.weights
    derived = payload.derived
    values = {
        "sleep_altered_days_3d": (derived.get("sleep_altered_days_3d") or 0) / 3,
        "sleep_baseline_deviation_14d": max(0.0, derived.get("sleep_baseline_deviation_14d") or 0.0),
        "wake_adverse_days_3d": (derived.get("wake_adverse_days_3d") or 0) / 3,
        "low_regulation_days_3d": (derived.get("low_regulation_days_3d") or 0) / 3,
        "regulation_trend_3d": max(0.0, -(derived.get("regulation_trend_3d") or 0.0)),
        "dysregulation_events_7d": min((derived.get("dysregulation_events_7d") or 0) / 3, 1.0),
        "adverse_factor_count_current": min((derived.get("adverse_factor_count_current") or 0) / 7, 1.0),
        "relevant_trigger_exposure": 1.0 if derived.get("relevant_trigger_exposure") else 0.0,
        "alert_outside_optimal": 1.0 if derived.get("alert_outside_optimal") else 0.0,
        "routine_change": 1.0 if payload.features.get("routine_change") is True else 0.0,
    }
    contributions = {key: round(values[key] * weights[key], 4) for key in values}
    score = config.risk_scoring.intercept + sum(contributions.values())
    return round(_clamp(score), 4), contributions


def _confidence_score(data_quality: dict[str, Any], config: ModelConfig) -> float:
    if not data_quality:
        return 0.0
    weights = config.confidence_scoring.weights
    hours_since_last = data_quality.get("hours_since_last_record")
    maximum_age = config.minimum_data.max_record_age_hours
    record_recency = 0.0 if hours_since_last is None else _clamp(1 - (hours_since_last / maximum_age))
    sources = data_quality.get("sources") or []
    components = {
        "critical_completeness": (data_quality.get("critical_present") or 0)
        / (data_quality.get("critical_total") or config.minimum_data.critical_groups_total),
        "record_recency": record_recency,
        "source_coverage": min(len(sources) / 2, 1.0),
        "history_depth": min((data_quality.get("history_days") or 0) / config.windows.baseline_target_valid_days, 1.0),
        "record_consistency": config.confidence_scoring.record_consistency_default,
    }
    return round(_clamp(sum(components[key] * weights[key] for key in weights)), 4)


def _top_factors(
    contributions: dict[str, float],
    payload: PredictionEngineInput,
    config: ModelConfig,
) -> list[dict[str, Any]]:
    candidates = [(key, value) for key, value in contributions.items() if value > 0]
    candidates.sort(key=lambda item: item[1], reverse=True)
    factors = []
    for key, contribution in candidates[:3]:
        mapping = config.factor_mappings[key]
        factors.append(
            {
                "code": mapping.code.value,
                "label": mapping.label,
                "direction": mapping.direction.value,
                "window": mapping.window.value,
                "type": mapping.factor_type,
                "contribution": contribution,
            }
        )
    return factors


def _required_fields(data_quality: dict[str, Any]) -> list[str]:
    critical = [item["field"] for item in data_quality.get("missing_critical_data", [])]
    return sorted(set(critical or data_quality.get("missing_fields", [])))


def _clamp(value: float) -> float:
    return max(0.0, min(1.0, value))
