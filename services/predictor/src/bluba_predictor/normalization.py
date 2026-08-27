from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum
from types import MappingProxyType
from typing import Any, Mapping

from .domain import PredictionEngineInput


class NormalizationError(ValueError):
    pass


class SleepQuality(str, Enum):
    REPARADOR = "reparador"
    INTERRUMPIDO = "interrumpido"
    DIFICULTAD_CONCILIACION = "dificultad_conciliacion"
    UNKNOWN = "desconocido"


class WakeState(str, Enum):
    TRANQUILO_ALEGRE = "tranquilo_alegre"
    IRRITABLE_LLORANDO = "irritable_llorando"
    CANSADO_SUENO = "cansado_sueno"
    UNKNOWN = "desconocido"


class RegulationLevel(str, Enum):
    EXCELENTE = "excelente"
    ESTABLE_CON_APOYO = "estable_con_apoyo"
    DESREGULACION_FRECUENTE = "desregulacion_frecuente"
    UNKNOWN = "desconocido"


class AlertLevel(str, Enum):
    BAJO = "bajo"
    OPTIMO = "optimo"
    ALTO = "alto"
    UNKNOWN = "desconocido"


class RecordSource(str, Enum):
    FAMILY = "FAMILY"
    SCHOOL = "SCHOOL"
    PROFESSIONAL = "PROFESSIONAL"


@dataclass(frozen=True)
class MissingDataItem:
    field: str
    state: str
    priority: int | None = None
    reason: str | None = None

    def as_dict(self) -> dict[str, Any]:
        item: dict[str, Any] = {"field": self.field, "state": self.state}
        if self.priority is not None:
            item["priority"] = self.priority
        if self.reason is not None:
            item["reason"] = self.reason
        return item


@dataclass(frozen=True)
class NormalizedFeatures:
    sleep_quality: SleepQuality | None
    sleep_hours: float | None
    wake_state: WakeState | None
    regulation_level: RegulationLevel | None
    alert_level: AlertLevel | None
    routine_change: bool | None
    gastrointestinal_status: str | None
    observed_behavior: tuple[str, ...]
    exceptional_event: bool | None
    sensory_profile: tuple[str, ...]

    def as_dict(self) -> dict[str, Any]:
        return {
            "sleep_quality": _enum_value(self.sleep_quality),
            "sleep_hours": self.sleep_hours,
            "wake_state": _enum_value(self.wake_state),
            "regulation_level": _enum_value(self.regulation_level),
            "alert_level": _enum_value(self.alert_level),
            "routine_change": self.routine_change,
            "gastrointestinal_status": self.gastrointestinal_status,
            "observed_behavior": list(self.observed_behavior),
            "exceptional_event": self.exceptional_event,
            "sensory_profile": list(self.sensory_profile),
        }


@dataclass(frozen=True)
class NormalizedDerivedFeatures:
    sleep_altered_days_3d: int
    sleep_baseline_deviation_14d: float | None
    wake_adverse_days_3d: int
    low_regulation_days_3d: int
    regulation_trend_3d: float | None
    dysregulation_events_7d: int
    days_since_last_dysregulation: float | None
    adverse_factor_count_current: int
    relevant_trigger_exposure: bool
    alert_outside_optimal: bool


@dataclass(frozen=True)
class NormalizedDataQuality:
    completeness: float
    critical_present: int | None
    critical_total: int | None
    hours_since_last_record: float | None
    history_days: int
    sources: tuple[RecordSource, ...]
    missing_fields: tuple[str, ...]
    missing_critical_data: tuple[MissingDataItem, ...]
    contains_synthetic_data: bool

    def as_dict(self) -> dict[str, Any]:
        return {
            "completeness": self.completeness,
            "critical_present": self.critical_present,
            "critical_total": self.critical_total,
            "hours_since_last_record": self.hours_since_last_record,
            "history_days": self.history_days,
            "sources": [source.value for source in self.sources],
            "missing_fields": list(self.missing_fields),
            "missing_critical_data": [item.as_dict() for item in self.missing_critical_data],
            "contains_synthetic_data": self.contains_synthetic_data,
        }


@dataclass(frozen=True)
class NormalizedPredictionInput:
    child_id: str
    prediction_at: str
    horizon_hours: int
    features: NormalizedFeatures
    derived: NormalizedDerivedFeatures
    data_quality: NormalizedDataQuality


_FEATURE_KEYS = frozenset(NormalizedFeatures.__dataclass_fields__)
_DERIVED_KEYS = frozenset(NormalizedDerivedFeatures.__dataclass_fields__)
_DATA_QUALITY_KEYS = frozenset(NormalizedDataQuality.__dataclass_fields__)
_REQUIRED_DATA_QUALITY_KEYS = frozenset({"completeness", "history_days", "sources", "missing_fields"})
_MISSING_DATA_ITEM_KEYS = frozenset({"field", "state", "priority", "reason"})
_REQUIRED_MISSING_DATA_ITEM_KEYS = frozenset({"field", "state"})
_MISSING_STATES = frozenset({"MISSING", "STALE"})
_SNAKE_CASE_BOUNDARY = re.compile(r"[\s\-]+")


def normalize_prediction_input(payload: PredictionEngineInput) -> NormalizedPredictionInput:
    if not isinstance(payload, PredictionEngineInput):
        raise NormalizationError("payload must be PredictionEngineInput")

    child_id = _required_string(payload.child_id, "child_id")
    prediction_at = _required_string(payload.prediction_at, "prediction_at")
    features = _mapping(payload.features, "features")
    derived = _mapping(payload.derived, "derived")
    data_quality = _mapping(payload.data_quality, "data_quality")

    _reject_key_mismatch(features, _FEATURE_KEYS, "features")
    _reject_key_mismatch(derived, _DERIVED_KEYS, "derived")
    _reject_section_keys(data_quality, _DATA_QUALITY_KEYS, _REQUIRED_DATA_QUALITY_KEYS, "data_quality")

    return NormalizedPredictionInput(
        child_id=child_id,
        prediction_at=prediction_at,
        horizon_hours=_integer(payload.horizon_hours, "horizon_hours"),
        features=NormalizedFeatures(
            sleep_quality=_nullable_enum(features["sleep_quality"], SleepQuality, "features.sleep_quality"),
            sleep_hours=_nullable_number(features["sleep_hours"], "features.sleep_hours", minimum=0, maximum=24),
            wake_state=_nullable_enum(features["wake_state"], WakeState, "features.wake_state"),
            regulation_level=_nullable_enum(
                features["regulation_level"],
                RegulationLevel,
                "features.regulation_level",
            ),
            alert_level=_nullable_enum(features["alert_level"], AlertLevel, "features.alert_level"),
            routine_change=_nullable_bool(features["routine_change"], "features.routine_change"),
            gastrointestinal_status=_nullable_open_string(
                features["gastrointestinal_status"],
                "features.gastrointestinal_status",
                max_length=64,
            ),
            observed_behavior=_string_tuple(features["observed_behavior"], "features.observed_behavior", 96),
            exceptional_event=_nullable_bool(features["exceptional_event"], "features.exceptional_event"),
            sensory_profile=_string_tuple(features["sensory_profile"], "features.sensory_profile", 96),
        ),
        derived=NormalizedDerivedFeatures(
            sleep_altered_days_3d=_integer_range(derived["sleep_altered_days_3d"], "derived.sleep_altered_days_3d", 0, 3),
            sleep_baseline_deviation_14d=_nullable_number(
                derived["sleep_baseline_deviation_14d"],
                "derived.sleep_baseline_deviation_14d",
            ),
            wake_adverse_days_3d=_integer_range(derived["wake_adverse_days_3d"], "derived.wake_adverse_days_3d", 0, 3),
            low_regulation_days_3d=_integer_range(
                derived["low_regulation_days_3d"],
                "derived.low_regulation_days_3d",
                0,
                3,
            ),
            regulation_trend_3d=_nullable_number(derived["regulation_trend_3d"], "derived.regulation_trend_3d"),
            dysregulation_events_7d=_integer_min(
                derived["dysregulation_events_7d"],
                "derived.dysregulation_events_7d",
                0,
            ),
            days_since_last_dysregulation=_nullable_number(
                derived["days_since_last_dysregulation"],
                "derived.days_since_last_dysregulation",
                minimum=0,
            ),
            adverse_factor_count_current=_integer_min(
                derived["adverse_factor_count_current"],
                "derived.adverse_factor_count_current",
                0,
            ),
            relevant_trigger_exposure=_bool(derived["relevant_trigger_exposure"], "derived.relevant_trigger_exposure"),
            alert_outside_optimal=_bool(derived["alert_outside_optimal"], "derived.alert_outside_optimal"),
        ),
        data_quality=NormalizedDataQuality(
            completeness=_number(data_quality["completeness"], "data_quality.completeness", minimum=0, maximum=1),
            critical_present=_nullable_integer_min(data_quality.get("critical_present"), "data_quality.critical_present", 0),
            critical_total=_nullable_integer_min(data_quality.get("critical_total"), "data_quality.critical_total", 0),
            hours_since_last_record=_nullable_number(
                data_quality.get("hours_since_last_record"),
                "data_quality.hours_since_last_record",
                minimum=0,
            ),
            history_days=_integer_min(data_quality["history_days"], "data_quality.history_days", 0),
            sources=_record_sources(data_quality["sources"], "data_quality.sources"),
            missing_fields=_string_tuple(data_quality["missing_fields"], "data_quality.missing_fields"),
            missing_critical_data=_missing_data_items(
                data_quality.get("missing_critical_data", []),
                "data_quality.missing_critical_data",
            ),
            contains_synthetic_data=_bool(
                data_quality.get("contains_synthetic_data", False),
                "data_quality.contains_synthetic_data",
            ),
        ),
    )


def _enum_value(value: Enum | None) -> str | None:
    return value.value if value is not None else None


def _mapping(value: Any, path: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise NormalizationError(f"{path} must be an object")
    return MappingProxyType(dict(value))


def _reject_key_mismatch(value: Mapping[str, Any], expected: frozenset[str], path: str) -> None:
    _reject_section_keys(value, expected, expected, path)


def _reject_section_keys(
    value: Mapping[str, Any],
    allowed: frozenset[str],
    required: frozenset[str],
    path: str,
) -> None:
    actual = set(value)
    missing = sorted(required - actual)
    extra = sorted(actual - allowed)
    if missing:
        raise NormalizationError(f"{path} is missing required fields: {', '.join(missing)}")
    if extra:
        raise NormalizationError(f"{path} contains unsupported fields: {', '.join(extra)}")


def _required_string(value: Any, path: str) -> str:
    normalized = _string(value, path)
    if not normalized:
        raise NormalizationError(f"{path} is required")
    return normalized


def _string(value: Any, path: str, max_length: int | None = None) -> str:
    if not isinstance(value, str):
        raise NormalizationError(f"{path} must be a string")
    normalized = value.strip()
    if max_length is not None and len(normalized) > max_length:
        raise NormalizationError(f"{path} must be at most {max_length} characters")
    return normalized


def _nullable_open_string(value: Any, path: str, max_length: int) -> str | None:
    if value is None:
        return None
    normalized = _string(value, path, max_length=max_length).lower()
    return _SNAKE_CASE_BOUNDARY.sub("_", normalized)


def _nullable_enum(value: Any, enum_type: type[Enum], path: str) -> Enum | None:
    if value is None:
        return None
    normalized = _string(value, path).lower()
    normalized = _SNAKE_CASE_BOUNDARY.sub("_", normalized)
    try:
        return enum_type(normalized)
    except ValueError as exc:
        raise NormalizationError(f"{path} must be one of {', '.join(item.value for item in enum_type)} or null") from exc


def _string_tuple(value: Any, path: str, max_length: int | None = None) -> tuple[str, ...]:
    if not isinstance(value, list):
        raise NormalizationError(f"{path} must be an array")
    normalized = tuple(_string(item, f"{path}[]", max_length=max_length) for item in value)
    if len(set(normalized)) != len(normalized):
        raise NormalizationError(f"{path} must contain unique values")
    return normalized


def _bool(value: Any, path: str) -> bool:
    if not isinstance(value, bool):
        raise NormalizationError(f"{path} must be a boolean")
    return value


def _nullable_bool(value: Any, path: str) -> bool | None:
    if value is None:
        return None
    return _bool(value, path)


def _integer(value: Any, path: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise NormalizationError(f"{path} must be an integer")
    return value


def _integer_min(value: Any, path: str, minimum: int) -> int:
    normalized = _integer(value, path)
    if normalized < minimum:
        raise NormalizationError(f"{path} must be >= {minimum}")
    return normalized


def _integer_range(value: Any, path: str, minimum: int, maximum: int) -> int:
    normalized = _integer_min(value, path, minimum)
    if normalized > maximum:
        raise NormalizationError(f"{path} must be <= {maximum}")
    return normalized


def _nullable_integer_min(value: Any, path: str, minimum: int) -> int | None:
    if value is None:
        return None
    return _integer_min(value, path, minimum)


def _number(value: Any, path: str, minimum: float | None = None, maximum: float | None = None) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise NormalizationError(f"{path} must be a number")
    normalized = float(value)
    if minimum is not None and normalized < minimum:
        raise NormalizationError(f"{path} must be >= {minimum}")
    if maximum is not None and normalized > maximum:
        raise NormalizationError(f"{path} must be <= {maximum}")
    return normalized


def _nullable_number(
    value: Any,
    path: str,
    minimum: float | None = None,
    maximum: float | None = None,
) -> float | None:
    if value is None:
        return None
    return _number(value, path, minimum=minimum, maximum=maximum)


def _record_sources(value: Any, path: str) -> tuple[RecordSource, ...]:
    if not isinstance(value, list):
        raise NormalizationError(f"{path} must be an array")
    sources = tuple(_record_source(item, f"{path}[]") for item in value)
    if len(set(sources)) != len(sources):
        raise NormalizationError(f"{path} must contain unique values")
    return sources


def _record_source(value: Any, path: str) -> RecordSource:
    normalized = _string(value, path).upper()
    try:
        return RecordSource(normalized)
    except ValueError as exc:
        raise NormalizationError(f"{path} must be one of FAMILY, SCHOOL, PROFESSIONAL") from exc


def _missing_data_items(value: Any, path: str) -> tuple[MissingDataItem, ...]:
    if not isinstance(value, list):
        raise NormalizationError(f"{path} must be an array")
    return tuple(_missing_data_item(item, f"{path}[]") for item in value)


def _missing_data_item(value: Any, path: str) -> MissingDataItem:
    item = _mapping(value, path)
    _reject_section_keys(item, _MISSING_DATA_ITEM_KEYS, _REQUIRED_MISSING_DATA_ITEM_KEYS, path)
    field = _required_string(item["field"], f"{path}.field")
    state = _string(item["state"], f"{path}.state").upper()
    if state not in _MISSING_STATES:
        raise NormalizationError(f"{path}.state must be MISSING or STALE")
    priority = _nullable_integer_min(item.get("priority"), f"{path}.priority", 1)
    if priority is not None and priority > 5:
        raise NormalizationError(f"{path}.priority must be <= 5")
    reason = None if item.get("reason") is None else _string(item["reason"], f"{path}.reason", max_length=500)
    return MissingDataItem(field=field, state=state, priority=priority, reason=reason)
