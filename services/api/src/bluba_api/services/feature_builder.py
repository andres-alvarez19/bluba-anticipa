from __future__ import annotations

from datetime import datetime, timedelta
from statistics import mean
from typing import Any

from bluba_predictor import PredictionEngineInput

from bluba_api.store import SqlAlchemyStore, parse_domain_datetime


CANONICAL_FIELDS = (
    "sleep_quality",
    "sleep_hours",
    "wake_state",
    "regulation_level",
    "alert_level",
    "routine_change",
    "gastrointestinal_status",
    "observed_behavior",
    "exceptional_event",
    "sensory_profile",
)


class FeatureBuilder:
    def __init__(self, store: SqlAlchemyStore) -> None:
        self.store = store

    def build(self, child_id: str, prediction_at: datetime) -> PredictionEngineInput:
        recent_start = prediction_at - timedelta(hours=72)
        baseline_end = recent_start
        baseline_start = baseline_end - timedelta(days=21)

        all_records = self.store.list_daily_records(child_id, to_at=prediction_at)
        recent_records = self.store.list_daily_records(child_id, from_at=recent_start, to_at=prediction_at)
        baseline_records = self.store.list_daily_records(child_id, from_at=baseline_start, to_at=baseline_end)
        events_7d = self.store.list_dysregulation_events(
            child_id,
            from_at=prediction_at - timedelta(days=7),
            to_at=prediction_at,
        )
        all_events = self.store.list_dysregulation_events(child_id, to_at=prediction_at)

        latest = self.store.latest_daily_record_before(child_id, prediction_at)
        features = _canonical_features(latest)
        derived = _derived_features(features, recent_records, baseline_records, events_7d, all_events, prediction_at)
        data_quality = _data_quality(features, all_records, prediction_at)

        return PredictionEngineInput(
            child_id=child_id,
            prediction_at=prediction_at.isoformat(),
            horizon_hours=24,
            features=features,
            derived=derived,
            data_quality=data_quality,
        )


def _canonical_features(record: dict[str, Any] | None) -> dict[str, Any]:
    values = dict(record.get("features") or {}) if record else {}
    return {
        "sleep_quality": values.get("sleep_quality"),
        "sleep_hours": values.get("sleep_hours"),
        "wake_state": values.get("wake_state"),
        "regulation_level": values.get("regulation_level"),
        "alert_level": values.get("alert_level"),
        "routine_change": values.get("routine_change"),
        "gastrointestinal_status": values.get("gastrointestinal_status"),
        "observed_behavior": list(values.get("observed_behavior") or []),
        "exceptional_event": values.get("exceptional_event"),
        "sensory_profile": list(values.get("sensory_profile") or []),
    }


def _derived_features(
    current: dict[str, Any],
    recent_records: list[dict[str, Any]],
    baseline_records: list[dict[str, Any]],
    events_7d: list[dict[str, Any]],
    all_events: list[dict[str, Any]],
    prediction_at: datetime,
) -> dict[str, Any]:
    recent_by_day = _latest_features_by_local_day(recent_records)
    baseline_by_day = _latest_features_by_local_day(baseline_records)

    recent_sleep_known = [_sleep_altered(features) for features in recent_by_day.values() if _known(features.get("sleep_quality"))]
    baseline_sleep_known = [
        _sleep_altered(features) for features in baseline_by_day.values() if _known(features.get("sleep_quality"))
    ]
    sleep_deviation = None
    if recent_sleep_known and len(baseline_sleep_known) >= 7:
        sleep_deviation = round(mean(recent_sleep_known) - mean(baseline_sleep_known), 4)

    regulation_values = [
        _regulation_value(features.get("regulation_level"))
        for _, features in sorted(recent_by_day.items(), key=lambda item: item[0])
    ]
    regulation_values = [value for value in regulation_values if value is not None]

    dysregulation_events_7d = [
        event for event in events_7d if event.get("event_type", "DYSREGULATION") == "DYSREGULATION"
    ]
    prior_dysregulations = [
        event for event in all_events if event.get("event_type", "DYSREGULATION") == "DYSREGULATION"
    ]
    last_dysregulation_at = (
        parse_domain_datetime(prior_dysregulations[-1]["occurred_at"]) if prior_dysregulations else None
    )

    alert_outside_optimal = current.get("alert_level") in {"bajo", "alto"}
    relevant_trigger_exposure = _relevant_trigger_exposure(current)

    return {
        "sleep_altered_days_3d": sum(1 for features in recent_by_day.values() if _sleep_altered(features)),
        "sleep_baseline_deviation_14d": sleep_deviation,
        "wake_adverse_days_3d": sum(1 for features in recent_by_day.values() if _wake_adverse(features)),
        "low_regulation_days_3d": sum(1 for features in recent_by_day.values() if _low_regulation(features)),
        "regulation_trend_3d": _simple_trend(regulation_values),
        "dysregulation_events_7d": len(dysregulation_events_7d),
        "days_since_last_dysregulation": (
            round((prediction_at - last_dysregulation_at).total_seconds() / 86400, 4)
            if last_dysregulation_at is not None
            else None
        ),
        "adverse_factor_count_current": _adverse_factor_count(
            current,
            alert_outside_optimal=alert_outside_optimal,
            relevant_trigger_exposure=relevant_trigger_exposure,
        ),
        "relevant_trigger_exposure": relevant_trigger_exposure,
        "alert_outside_optimal": alert_outside_optimal,
    }


def _data_quality(features: dict[str, Any], records: list[dict[str, Any]], prediction_at: datetime) -> dict[str, Any]:
    present_fields = [field for field in CANONICAL_FIELDS if _field_present(field, features.get(field))]
    missing_fields = [field for field in CANONICAL_FIELDS if field not in present_fields]
    critical_present = sum(
        [
            _field_present("sleep_quality", features.get("sleep_quality")) or features.get("sleep_hours") is not None,
            _field_present("wake_state", features.get("wake_state")),
            _field_present("regulation_level", features.get("regulation_level"))
            or bool(features.get("observed_behavior")),
        ]
    )
    missing_critical_data = []
    if not (_field_present("sleep_quality", features.get("sleep_quality")) or features.get("sleep_hours") is not None):
        missing_critical_data.append(_missing_item("sleep_quality", "Falta registrar sueño."))
    if not _field_present("wake_state", features.get("wake_state")):
        missing_critical_data.append(_missing_item("wake_state", "Falta registrar estado al despertar."))
    if not (_field_present("regulation_level", features.get("regulation_level")) or bool(features.get("observed_behavior"))):
        missing_critical_data.append(_missing_item("regulation_level", "Falta registrar regulación o conducta."))

    latest_recorded_at = parse_domain_datetime(records[-1]["recorded_at"]) if records else None
    history_days = len({parse_domain_datetime(record["recorded_at"]).date() for record in records})
    sources = sorted({record.get("source") for record in records if record.get("source")})

    return {
        "completeness": round(len(present_fields) / len(CANONICAL_FIELDS), 4),
        "critical_present": critical_present,
        "critical_total": 3,
        "hours_since_last_record": (
            round((prediction_at - latest_recorded_at).total_seconds() / 3600, 4)
            if latest_recorded_at is not None
            else None
        ),
        "history_days": history_days,
        "sources": sources,
        "missing_fields": missing_fields,
        "missing_critical_data": missing_critical_data,
        "contains_synthetic_data": any(bool(record.get("synthetic")) for record in records),
    }


def _latest_features_by_local_day(records: list[dict[str, Any]]) -> dict[Any, dict[str, Any]]:
    by_day: dict[Any, dict[str, Any]] = {}
    for record in records:
        by_day[parse_domain_datetime(record["recorded_at"]).date()] = dict(record.get("features") or {})
    return by_day


def _known(value: Any) -> bool:
    return value not in (None, "desconocido", [])


def _field_present(field: str, value: Any) -> bool:
    if field in {"observed_behavior", "sensory_profile"}:
        return bool(value)
    return _known(value)


def _missing_item(field: str, reason: str) -> dict[str, Any]:
    return {"field": field, "state": "MISSING", "priority": 1, "reason": reason}


def _sleep_altered(features: dict[str, Any]) -> bool:
    return features.get("sleep_quality") in {"interrumpido", "dificultad_conciliacion"}


def _wake_adverse(features: dict[str, Any]) -> bool:
    return features.get("wake_state") in {"irritable_llorando", "cansado_sueno"}


def _low_regulation(features: dict[str, Any]) -> bool:
    return features.get("regulation_level") == "desregulacion_frecuente"


def _regulation_value(value: Any) -> float | None:
    return {"excelente": 2.0, "estable_con_apoyo": 1.0, "desregulacion_frecuente": 0.0}.get(value)


def _simple_trend(values: list[float]) -> float | None:
    if len(values) < 2:
        return None
    x_mean = (len(values) - 1) / 2
    y_mean = mean(values)
    denominator = sum((index - x_mean) ** 2 for index in range(len(values)))
    if denominator == 0:
        return 0.0
    slope = sum((index - x_mean) * (value - y_mean) for index, value in enumerate(values)) / denominator
    return round(slope / 2, 4)


def _relevant_trigger_exposure(features: dict[str, Any]) -> bool:
    observed = set(features.get("observed_behavior") or [])
    sensory = set(features.get("sensory_profile") or [])
    return "hipersensibilidad_auditiva" in sensory and bool(observed & {"ruido_intenso", "sobrecarga_sensorial"})


def _adverse_factor_count(
    features: dict[str, Any],
    *,
    alert_outside_optimal: bool,
    relevant_trigger_exposure: bool,
) -> int:
    return sum(
        [
            _sleep_altered(features),
            _wake_adverse(features),
            _low_regulation(features),
            features.get("routine_change") is True,
            features.get("exceptional_event") is True,
            alert_outside_optimal,
            relevant_trigger_exposure,
        ]
    )
