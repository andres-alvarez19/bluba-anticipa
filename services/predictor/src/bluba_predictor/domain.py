from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any, TypedDict


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ConfidenceLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class PredictionStatus(str, Enum):
    OK = "OK"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
    ERROR = "ERROR"


class FactorDirection(str, Enum):
    INCREASES_RISK = "INCREASES_RISK"
    DECREASES_RISK = "DECREASES_RISK"


class FactorWindow(str, Enum):
    CURRENT = "current"
    HOURS_72 = "72h"
    DAYS_7 = "7d"
    BASELINE = "baseline"


class FactorCode(str, Enum):
    SLEEP_ALTERED_CURRENT = "SLEEP_ALTERED_CURRENT"
    SLEEP_ALTERED_3D = "SLEEP_ALTERED_3D"
    WAKE_ADVERSE_CURRENT = "WAKE_ADVERSE_CURRENT"
    WAKE_ADVERSE_3D = "WAKE_ADVERSE_3D"
    LOW_REGULATION_CURRENT = "LOW_REGULATION_CURRENT"
    LOW_REGULATION_3D = "LOW_REGULATION_3D"
    REGULATION_BELOW_BASELINE = "REGULATION_BELOW_BASELINE"
    ALERT_OUTSIDE_OPTIMAL = "ALERT_OUTSIDE_OPTIMAL"
    ROUTINE_CHANGE = "ROUTINE_CHANGE"
    ROUTINE_CHANGES_3D = "ROUTINE_CHANGES_3D"
    GI_ALTERATION = "GI_ALTERATION"
    EXCEPTIONAL_EVENT = "EXCEPTIONAL_EVENT"
    MULTIPLE_ADVERSE_FACTORS = "MULTIPLE_ADVERSE_FACTORS"
    RECENT_DYSREGULATION = "RECENT_DYSREGULATION"
    SENSORY_TRIGGER_EXPOSURE = "SENSORY_TRIGGER_EXPOSURE"

    # Codes emitted by the temporary baseline scoring retained during P1.
    SLEEP_BASELINE_DEVIATION = "SLEEP_BASELINE_DEVIATION"
    REGULATION_TREND_3D = "REGULATION_TREND_3D"
    DYSREGULATION_HISTORY_7D = "DYSREGULATION_HISTORY_7D"
    MULTIFACTOR_ACCUMULATION = "MULTIFACTOR_ACCUMULATION"
    RELEVANT_TRIGGER_EXPOSURE = "RELEVANT_TRIGGER_EXPOSURE"


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
    prediction_at: str
    horizon_hours: int
    features: dict[str, Any]
    derived: dict[str, Any]
    data_quality: dict[str, Any]
