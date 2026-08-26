from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any, TypedDict


class PredictionDict(TypedDict):
    subject_id: str
    prediction_timestamp: str
    horizon_hours: int
    status: str
    risk: None
    confidence: dict[str, float | str]
    data_quality: dict[str, Any]
    top_factors: list[dict[str, Any]]
    recommendations: list[dict[str, Any]]
    insufficiency_reasons: list[str]


@dataclass(frozen=True)
class PredictionInput:
    subject_id: str
    horizon_hours: int = 24
    observations: list[dict[str, Any]] = field(default_factory=list)


def predict(payload: PredictionInput) -> PredictionDict:
    """Return an explicit no-model MVP prediction without fabricating risk."""
    if payload.horizon_hours < 1 or payload.horizon_hours > 168:
        raise ValueError("horizon_hours must be between 1 and 168")
    if not payload.subject_id:
        raise ValueError("subject_id is required")

    observed_features = {
        item.get("feature_key")
        for item in payload.observations
        if item.get("status") == "observed" and item.get("feature_key")
    }
    missing_features = sorted(
        feature
        for feature in ("sleep_quality", "regulation_state", "routine_change")
        if feature not in observed_features
    )

    return {
        "subject_id": payload.subject_id,
        "prediction_timestamp": datetime.now(UTC).isoformat(),
        "horizon_hours": payload.horizon_hours,
        "status": "insufficient_data",
        "risk": None,
        "confidence": {"score": 0.0, "level": "low"},
        "data_quality": {
            "score": 0.0,
            "missing_features": missing_features,
            "stale_features": [],
            "source_coverage": {
                "family": False,
                "school": False,
                "professional": False,
            },
        },
        "top_factors": [],
        "recommendations": [],
        "insufficiency_reasons": [
            "No predictive model or validated baseline is available in BOOTSTRAP-01.",
            "Critical longitudinal observations are not available yet.",
        ],
    }
