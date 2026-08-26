from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any, TypedDict
from uuid import uuid4


class PredictionEngineOutput(TypedDict):
    prediction_id: str
    child_id: str
    prediction_at: str
    window_end_at: str
    horizon_hours: int
    model_version: str
    feature_schema_version: str
    status: str
    risk: dict[str, Any] | None
    confidence: dict[str, Any]
    data_quality: dict[str, Any]
    top_factors: list[dict[str, Any]]
    warnings: list[dict[str, Any]]
    required_fields: list[str]


@dataclass(frozen=True)
class PredictionEngineInput:
    child_id: str
    horizon_hours: int = 24
    prediction_at: str | None = None
    features: dict[str, Any] = field(default_factory=dict)
    derived: dict[str, Any] = field(default_factory=dict)
    data_quality: dict[str, Any] = field(default_factory=dict)


def predict(payload: PredictionEngineInput) -> PredictionEngineOutput:
    if payload.horizon_hours != 24:
        raise ValueError("horizon_hours must be 24")
    if not payload.child_id:
        raise ValueError("child_id is required")

    config = _load_config()
    prediction_at = _parse_datetime(payload.prediction_at) if payload.prediction_at else datetime.now(UTC)
    confidence_score = _confidence_score(payload.data_quality, config)
    confidence = {"score": confidence_score, "level": _band(confidence_score, config["confidence"]["bands"])}

    missing_critical = payload.data_quality.get("missing_critical_data") or []
    risk_score, contributions = _risk_score(payload, config)
    required_fields = _required_fields(payload.data_quality)
    warnings: list[dict[str, Any]] = []

    if len(missing_critical) >= 2 or confidence_score < config["confidence"]["minimum_score_for_prediction"]:
        status = "INSUFFICIENT_DATA"
        risk = None
        top_factors: list[dict[str, Any]] = []
        warnings.append(
            {
                "code": "INSUFFICIENT_CRITICAL_DATA",
                "severity": "WARNING",
                "message": "No existe evidencia mínima suficiente para emitir una estimación de riesgo.",
            }
        )
    else:
        status = "LOW_CONFIDENCE" if confidence["level"] == "LOW" else "OK"
        risk = {"score": risk_score, "level": _band(risk_score, config["risk"]["bands"])}
        top_factors = _top_factors(contributions, payload, config)
        if status == "LOW_CONFIDENCE":
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
        "model_version": config["model_version"],
        "feature_schema_version": "features-mvp-v1",
        "status": status,
        "risk": risk,
        "confidence": confidence,
        "data_quality": payload.data_quality or _empty_data_quality(),
        "top_factors": top_factors,
        "warnings": warnings,
        "required_fields": required_fields,
    }


def _load_config() -> dict[str, Any]:
    path = Path(__file__).resolve().parents[2] / "models" / "baseline-v1.yaml"
    with path.open(encoding="utf-8") as config_file:
        return json.load(config_file)


def _parse_datetime(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed


def _risk_score(payload: PredictionEngineInput, config: dict[str, Any]) -> tuple[float, dict[str, float]]:
    weights = config["risk"]["weights"]
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
    score = config["risk"]["intercept"] + sum(contributions.values())
    return round(_clamp(score), 4), contributions


def _confidence_score(data_quality: dict[str, Any], config: dict[str, Any]) -> float:
    if not data_quality:
        return 0.0
    weights = config["confidence"]["weights"]
    hours_since_last = data_quality.get("hours_since_last_record")
    record_recency = 0.0 if hours_since_last is None else _clamp(1 - (hours_since_last / 72))
    sources = data_quality.get("sources") or []
    components = {
        "critical_completeness": (data_quality.get("critical_present") or 0) / (data_quality.get("critical_total") or 3),
        "record_recency": record_recency,
        "source_coverage": min(len(sources) / 2, 1.0),
        "history_depth": min((data_quality.get("history_days") or 0) / 14, 1.0),
        "record_consistency": 1.0,
    }
    return round(_clamp(sum(components[key] * weights[key] for key in weights)), 4)


def _top_factors(
    contributions: dict[str, float],
    payload: PredictionEngineInput,
    config: dict[str, Any],
) -> list[dict[str, Any]]:
    candidates = [(key, value) for key, value in contributions.items() if value > 0]
    candidates.sort(key=lambda item: item[1], reverse=True)
    factors = []
    for key, contribution in candidates[:3]:
        mapping = dict(config["factor_mappings"][key])
        mapping["contribution"] = contribution
        factors.append(mapping)
    return factors


def _band(score: float, bands: dict[str, list[float]]) -> str:
    for level, (minimum, maximum) in bands.items():
        if minimum <= score <= maximum:
            return level
    ordered = list(bands.items())
    for index, (level, (_, maximum)) in enumerate(ordered[:-1]):
        next_minimum = ordered[index + 1][1][0]
        if maximum < score < next_minimum:
            return level
    return ordered[-1][0] if score > ordered[-1][1][1] else ordered[0][0]


def _required_fields(data_quality: dict[str, Any]) -> list[str]:
    critical = [item["field"] for item in data_quality.get("missing_critical_data", [])]
    return sorted(set(critical or data_quality.get("missing_fields", [])))


def _empty_data_quality() -> dict[str, Any]:
    return {
        "completeness": 0.0,
        "critical_present": 0,
        "critical_total": 3,
        "hours_since_last_record": None,
        "history_days": 0,
        "sources": [],
        "missing_fields": ["sleep_quality", "wake_state", "regulation_level"],
        "missing_critical_data": [
            {"field": "sleep_quality", "state": "MISSING", "priority": 1, "reason": "Falta registrar sueño."},
            {"field": "wake_state", "state": "MISSING", "priority": 1, "reason": "Falta registrar estado al despertar."},
            {
                "field": "regulation_level",
                "state": "MISSING",
                "priority": 1,
                "reason": "Falta registrar regulación o conducta.",
            },
        ],
        "contains_synthetic_data": False,
    }


def _clamp(value: float) -> float:
    return max(0.0, min(1.0, value))
