from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any, TypedDict
from uuid import uuid4


class PredictionDict(TypedDict):
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
class PredictionInput:
    child_id: str
    horizon_hours: int = 24
    features: dict[str, Any] = field(default_factory=dict)
    observations: list[dict[str, Any]] = field(default_factory=list)


def predict(payload: PredictionInput) -> PredictionDict:
    """Return an explicit no-model MVP prediction without fabricating risk."""
    if payload.horizon_hours < 1 or payload.horizon_hours > 168:
        raise ValueError("horizon_hours must be between 1 and 168")
    if not payload.child_id:
        raise ValueError("child_id is required")

    observed_features = {
        key
        for key, value in payload.features.items()
        if value not in (None, "desconocido", [])
    }
    missing_features = sorted(
        feature
        for feature in ("sleep_quality", "regulation_level", "routine_change")
        if feature not in observed_features
    )
    now = datetime.now(UTC).isoformat()

    return {
        "prediction_id": f"prediction-{uuid4()}",
        "child_id": payload.child_id,
        "prediction_at": now,
        "window_end_at": now,
        "horizon_hours": payload.horizon_hours,
        "model_version": "mock-deterministic-mvp",
        "feature_schema_version": "features-mvp-v1",
        "status": "INSUFFICIENT_DATA",
        "risk": None,
        "confidence": {"score": 0.0, "level": "LOW"},
        "data_quality": {
            "completeness": 0.0,
            "critical_present": 0,
            "critical_total": 3,
            "hours_since_last_record": None,
            "history_days": 0,
            "sources": [],
            "missing_fields": missing_features,
            "missing_critical_data": [
                {"field": field, "state": "MISSING", "priority": 1, "reason": "Required for MVP baseline"}
                for field in missing_features
            ],
            "contains_synthetic_data": False,
        },
        "top_factors": [],
        "warnings": [{
            "code": "INSUFFICIENT_LONGITUDINAL_DATA",
            "severity": "INFO",
            "message": "No hay datos longitudinales suficientes para emitir un score de riesgo.",
        }],
        "required_fields": missing_features,
    }
