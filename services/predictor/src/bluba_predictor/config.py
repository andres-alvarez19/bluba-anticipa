from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from types import MappingProxyType
from typing import Any, Mapping, TypeVar

from .domain import ConfidenceLevel, FactorCode, FactorDirection, FactorWindow, RiskLevel


MODEL_CONFIG_PATH = Path(__file__).resolve().parents[2] / "models" / "baseline-demo-v1.json"


class ModelConfigError(ValueError):
    pass


@dataclass(frozen=True)
class WindowsConfig:
    accumulators_hours: int
    event_history_days: int
    baseline_provisional_min_valid_days: int
    baseline_target_valid_days: int


@dataclass(frozen=True)
class MinimumDataConfig:
    critical_groups_total: int
    minimum_critical_groups_present: int
    max_record_age_hours: int


@dataclass(frozen=True)
class ThresholdBand:
    minimum: float
    maximum: float
    maximum_exclusive: bool

    def contains(self, score: float) -> bool:
        upper_matches = score < self.maximum if self.maximum_exclusive else score <= self.maximum
        return self.minimum <= score and upper_matches


@dataclass(frozen=True)
class LevelThresholds:
    low: ThresholdBand
    medium: ThresholdBand
    high: ThresholdBand

    def ordered(self) -> tuple[ThresholdBand, ThresholdBand, ThresholdBand]:
        return self.low, self.medium, self.high


@dataclass(frozen=True)
class RiskScoringConfig:
    intercept: float
    weights: Mapping[str, float]


@dataclass(frozen=True)
class ConfidenceScoringConfig:
    minimum_score_for_prediction: float
    record_consistency_default: float
    weights: Mapping[str, float]


@dataclass(frozen=True)
class FactorMapping:
    code: FactorCode
    label: str
    direction: FactorDirection
    window: FactorWindow
    factor_type: str


@dataclass(frozen=True)
class ModelConfig:
    model_version: str
    horizon_hours: int
    windows: WindowsConfig
    minimum_data: MinimumDataConfig
    risk_levels: LevelThresholds
    confidence_levels: LevelThresholds
    risk_scoring: RiskScoringConfig
    confidence_scoring: ConfidenceScoringConfig
    factor_mappings: Mapping[str, FactorMapping]


_FACTOR_CODE_BY_FEATURE = {
    "sleep_altered_days_3d": FactorCode.SLEEP_ALTERED_3D,
    "sleep_baseline_deviation_14d": FactorCode.SLEEP_BASELINE_DEVIATION,
    "wake_adverse_days_3d": FactorCode.WAKE_ADVERSE_3D,
    "low_regulation_days_3d": FactorCode.LOW_REGULATION_3D,
    "regulation_trend_3d": FactorCode.REGULATION_TREND_3D,
    "dysregulation_events_7d": FactorCode.DYSREGULATION_HISTORY_7D,
    "adverse_factor_count_current": FactorCode.MULTIFACTOR_ACCUMULATION,
    "relevant_trigger_exposure": FactorCode.RELEVANT_TRIGGER_EXPOSURE,
    "alert_outside_optimal": FactorCode.ALERT_OUTSIDE_OPTIMAL,
    "routine_change": FactorCode.ROUTINE_CHANGE,
}


def load_model_config(path: Path | None = None) -> ModelConfig:
    config_path = path or MODEL_CONFIG_PATH
    try:
        with config_path.open(encoding="utf-8") as config_file:
            raw = json.load(config_file)
    except (OSError, json.JSONDecodeError) as exc:
        raise ModelConfigError(f"cannot load model config {config_path}: {exc}") from exc
    return _parse_model_config(_mapping(raw, "config"))


def resolve_risk_level(score: float, config: ModelConfig) -> RiskLevel:
    return _resolve_level(score, config.risk_levels, RiskLevel)


def resolve_confidence_level(score: float, config: ModelConfig) -> ConfidenceLevel:
    return _resolve_level(score, config.confidence_levels, ConfidenceLevel)


def _parse_model_config(raw: Mapping[str, Any]) -> ModelConfig:
    model_version = _string(raw.get("model_version"), "model_version")
    horizon_hours = _integer(raw.get("horizon_hours"), "horizon_hours")
    if horizon_hours != 24:
        raise ModelConfigError("horizon_hours must be 24")

    windows_raw = _mapping(raw.get("windows"), "windows")
    windows = WindowsConfig(
        accumulators_hours=_positive_integer(windows_raw, "accumulators_hours", "windows"),
        event_history_days=_positive_integer(windows_raw, "event_history_days", "windows"),
        baseline_provisional_min_valid_days=_positive_integer(
            windows_raw,
            "baseline_provisional_min_valid_days",
            "windows",
        ),
        baseline_target_valid_days=_positive_integer(windows_raw, "baseline_target_valid_days", "windows"),
    )
    if windows.accumulators_hours != 72:
        raise ModelConfigError("windows.accumulators_hours must be 72")
    if windows.event_history_days != 7:
        raise ModelConfigError("windows.event_history_days must be 7")
    if windows.baseline_provisional_min_valid_days != 7:
        raise ModelConfigError("windows.baseline_provisional_min_valid_days must be 7")
    if windows.baseline_target_valid_days != 14:
        raise ModelConfigError("windows.baseline_target_valid_days must be 14")

    minimum_raw = _mapping(raw.get("minimum_data"), "minimum_data")
    minimum_data = MinimumDataConfig(
        critical_groups_total=_positive_integer(minimum_raw, "critical_groups_total", "minimum_data"),
        minimum_critical_groups_present=_positive_integer(
            minimum_raw,
            "minimum_critical_groups_present",
            "minimum_data",
        ),
        max_record_age_hours=_non_negative_integer(minimum_raw, "max_record_age_hours", "minimum_data"),
    )
    if minimum_data.minimum_critical_groups_present > minimum_data.critical_groups_total:
        raise ModelConfigError("minimum_data.minimum_critical_groups_present cannot exceed critical_groups_total")
    if minimum_data.max_record_age_hours != 72:
        raise ModelConfigError("minimum_data.max_record_age_hours must be 72")

    risk_levels = _thresholds(raw.get("risk_levels"), "risk_levels")
    confidence_levels = _thresholds(raw.get("confidence_levels"), "confidence_levels")

    risk_raw = _mapping(raw.get("risk_scoring"), "risk_scoring")
    confidence_raw = _mapping(raw.get("confidence_scoring"), "confidence_scoring")
    risk_scoring = RiskScoringConfig(
        intercept=_number(risk_raw.get("intercept"), "risk_scoring.intercept"),
        weights=_numeric_mapping(risk_raw.get("weights"), "risk_scoring.weights"),
    )
    confidence_scoring = ConfidenceScoringConfig(
        minimum_score_for_prediction=_unit_interval(
            confidence_raw.get("minimum_score_for_prediction"),
            "confidence_scoring.minimum_score_for_prediction",
        ),
        record_consistency_default=_unit_interval(
            confidence_raw.get("record_consistency_default"),
            "confidence_scoring.record_consistency_default",
        ),
        weights=_numeric_mapping(confidence_raw.get("weights"), "confidence_scoring.weights"),
    )
    if confidence_scoring.minimum_score_for_prediction >= confidence_levels.low.maximum:
        raise ModelConfigError("confidence_scoring.minimum_score_for_prediction must be below LOW upper boundary")

    mappings_raw = _mapping(raw.get("factor_mappings"), "factor_mappings")
    if set(mappings_raw) != set(_FACTOR_CODE_BY_FEATURE):
        raise ModelConfigError("factor_mappings must match the temporary scoring features")
    if set(risk_scoring.weights) != set(mappings_raw):
        raise ModelConfigError("risk_scoring.weights and factor_mappings must use the same features")
    if set(risk_scoring.weights) != set(_FACTOR_CODE_BY_FEATURE):
        raise ModelConfigError("risk_scoring.weights must match the temporary scoring features")
    if set(confidence_scoring.weights) != {
        "critical_completeness",
        "record_recency",
        "source_coverage",
        "history_depth",
        "record_consistency",
    }:
        raise ModelConfigError("confidence_scoring.weights must match confidence components")
    if any(weight < 0 for weight in risk_scoring.weights.values()):
        raise ModelConfigError("risk_scoring.weights must be non-negative")
    factor_mappings = {
        feature: _factor_mapping(feature, _mapping(value, f"factor_mappings.{feature}"))
        for feature, value in mappings_raw.items()
    }

    return ModelConfig(
        model_version=model_version,
        horizon_hours=horizon_hours,
        windows=windows,
        minimum_data=minimum_data,
        risk_levels=risk_levels,
        confidence_levels=confidence_levels,
        risk_scoring=risk_scoring,
        confidence_scoring=confidence_scoring,
        factor_mappings=MappingProxyType(factor_mappings),
    )


def _thresholds(value: Any, name: str) -> LevelThresholds:
    raw = _mapping(value, name)
    if list(raw) != ["LOW", "MEDIUM", "HIGH"]:
        raise ModelConfigError(f"{name} must define LOW, MEDIUM, HIGH in order")
    bands = tuple(_threshold_band(_mapping(raw[level], f"{name}.{level}"), f"{name}.{level}") for level in raw)
    if bands[0].minimum != 0.0 or bands[-1].maximum != 1.0:
        raise ModelConfigError(f"{name} must cover exactly [0.0, 1.0]")
    if not bands[0].maximum_exclusive or not bands[1].maximum_exclusive or bands[2].maximum_exclusive:
        raise ModelConfigError(f"{name} must use exclusive upper bounds except for HIGH")
    for previous, current in zip(bands, bands[1:]):
        if previous.maximum != current.minimum:
            relation = "overlap" if previous.maximum > current.minimum else "gap"
            raise ModelConfigError(f"{name} contains a threshold {relation}")
    return LevelThresholds(*bands)


def _threshold_band(raw: Mapping[str, Any], name: str) -> ThresholdBand:
    minimum = _number(raw.get("min"), f"{name}.min")
    has_exclusive = "max_exclusive" in raw
    has_inclusive = "max" in raw
    if has_exclusive == has_inclusive:
        raise ModelConfigError(f"{name} must define exactly one upper bound")
    maximum = _number(raw.get("max_exclusive" if has_exclusive else "max"), f"{name}.max")
    if not 0 <= minimum < maximum <= 1:
        raise ModelConfigError(f"{name} bounds must be ordered within [0.0, 1.0]")
    return ThresholdBand(minimum, maximum, has_exclusive)


Level = TypeVar("Level", RiskLevel, ConfidenceLevel)


def _resolve_level(score: float, thresholds: LevelThresholds, level_type: type[Level]) -> Level:
    validated_score = _unit_interval(score, "score")
    for name, band in zip(("LOW", "MEDIUM", "HIGH"), thresholds.ordered()):
        if band.contains(validated_score):
            return level_type(name)
    raise ModelConfigError("configured thresholds do not classify score")


def _factor_mapping(feature: str, raw: Mapping[str, Any]) -> FactorMapping:
    try:
        direction = FactorDirection(_string(raw.get("direction"), f"factor_mappings.{feature}.direction"))
        window = FactorWindow(_string(raw.get("window"), f"factor_mappings.{feature}.window"))
    except ValueError as exc:
        raise ModelConfigError(f"invalid factor mapping for {feature}: {exc}") from exc
    return FactorMapping(
        code=_FACTOR_CODE_BY_FEATURE[feature],
        label=_string(raw.get("label"), f"factor_mappings.{feature}.label"),
        direction=direction,
        window=window,
        factor_type=_string(raw.get("type"), f"factor_mappings.{feature}.type"),
    )


def _mapping(value: Any, name: str) -> Mapping[str, Any]:
    if not isinstance(value, dict):
        raise ModelConfigError(f"{name} must be an object")
    return value


def _numeric_mapping(value: Any, name: str) -> Mapping[str, float]:
    raw = _mapping(value, name)
    if not raw:
        raise ModelConfigError(f"{name} must not be empty")
    parsed = {key: _number(item, f"{name}.{key}") for key, item in raw.items()}
    return MappingProxyType(parsed)


def _string(value: Any, name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ModelConfigError(f"{name} must be a non-empty string")
    return value


def _integer(value: Any, name: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise ModelConfigError(f"{name} must be an integer")
    return value


def _positive_integer(raw: Mapping[str, Any], key: str, parent: str) -> int:
    value = _integer(raw.get(key), f"{parent}.{key}")
    if value <= 0:
        raise ModelConfigError(f"{parent}.{key} must be greater than zero")
    return value


def _non_negative_integer(raw: Mapping[str, Any], key: str, parent: str) -> int:
    value = _integer(raw.get(key), f"{parent}.{key}")
    if value < 0:
        raise ModelConfigError(f"{parent}.{key} must be non-negative")
    return value


def _number(value: Any, name: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        raise ModelConfigError(f"{name} must be a finite number")
    return float(value)


def _unit_interval(value: Any, name: str) -> float:
    number = _number(value, name)
    if not 0 <= number <= 1:
        raise ModelConfigError(f"{name} must be between zero and one")
    return number
