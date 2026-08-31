from datetime import UTC, datetime, timedelta

from bluba_api.services.feature_builder import FeatureBuilder
from bluba_api.services.prediction_service import PredictionService, to_risk_prediction
from bluba_api.store import SqlAlchemyStore
from bluba_predictor import PredictionEngineInput, predict


def test_adapter_maps_prediction_engine_output_to_risk_prediction() -> None:
    output = predict(_engine_input())

    prediction = to_risk_prediction(output)

    assert prediction["prediction_id"] == output["prediction_id"]
    assert prediction["child_id"] == "child-1"
    assert prediction["status"] == "INSUFFICIENT_DATA"
    assert prediction["risk"] is None
    assert prediction["confidence"]["level"] == "LOW"


def test_feature_builder_uses_history_before_cutoff_and_prediction_service_scores() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    store.add_child("child-1", "Niño demo")
    prediction_at = datetime(2026, 8, 26, 12, tzinfo=UTC)

    for day in range(14):
        store.add_daily_record(
            "child-1",
            _record(prediction_at - timedelta(days=17 - day), "reparador", "tranquilo_alegre", "estable_con_apoyo"),
        )
    store.add_daily_record(
        "child-1",
        _record(prediction_at - timedelta(days=2), "interrumpido", "cansado_sueno", "estable_con_apoyo"),
    )
    store.add_daily_record(
        "child-1",
        _record(prediction_at - timedelta(days=1), "interrumpido", "irritable_llorando", "estable_con_apoyo"),
    )
    store.add_daily_record(
        "child-1",
        _record(
            prediction_at - timedelta(hours=1),
            "interrumpido",
            "irritable_llorando",
            "desregulacion_frecuente",
            routine_change=True,
            alert_level="alto",
        ),
    )
    store.add_daily_record(
        "child-1",
        _record(prediction_at + timedelta(hours=1), "reparador", "tranquilo_alegre", "excelente"),
    )

    engine_input = FeatureBuilder(store).build("child-1", prediction_at)
    prediction = PredictionService(store).evaluate_current("child-1", prediction_at=prediction_at)

    assert engine_input.features["sleep_quality"] == "interrumpido"
    assert engine_input.derived["sleep_altered_days_3d"] == 3
    assert engine_input.derived["sleep_baseline_deviation_14d"] == 1.0
    assert engine_input.data_quality["history_days"] == 17
    assert prediction["risk"] is not None
    assert prediction["top_factors"]


def test_feature_builder_excludes_future_records_and_events_from_cutoff_features() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    store.add_child("child-1", "Niño demo")
    prediction_at = datetime(2026, 8, 26, 12, tzinfo=UTC)
    store.add_daily_record("child-1", _record(prediction_at - timedelta(hours=1), "reparador", "tranquilo_alegre", "excelente"))
    store.add_daily_record(
        "child-1",
        _record(
            prediction_at + timedelta(hours=1),
            "interrumpido",
            "irritable_llorando",
            "desregulacion_frecuente",
            alert_level="alto",
            routine_change=True,
        ),
    )
    store.add_event(
        "child-1",
        {
            "occurred_at": (prediction_at + timedelta(hours=1)).isoformat(),
            "event_type": "DYSREGULATION",
            "context": "HOME",
        },
    )

    engine_input = FeatureBuilder(store).build("child-1", prediction_at)

    assert engine_input.features["sleep_quality"] == "reparador"
    assert engine_input.derived["sleep_altered_days_3d"] == 0
    assert engine_input.derived["dysregulation_events_7d"] == 0
    assert engine_input.derived["days_since_last_dysregulation"] is None
    assert engine_input.data_quality["history_days"] == 1


def test_three_day_counters_do_not_exceed_three_when_72_hours_touch_four_dates() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    store.add_child("child-1", "Mateo")
    prediction_at = datetime(2026, 8, 30, 1, tzinfo=UTC)
    for hours_ago in (71, 48, 24, 1):
        store.add_daily_record(
            "child-1",
            _record(
                prediction_at - timedelta(hours=hours_ago),
                "interrumpido",
                "irritable_llorando",
                "desregulacion_frecuente",
            ),
        )

    engine_input = FeatureBuilder(store).build("child-1", prediction_at)

    assert engine_input.derived["sleep_altered_days_3d"] == 3
    assert engine_input.derived["wake_adverse_days_3d"] == 3
    assert engine_input.derived["low_regulation_days_3d"] == 3


def test_single_complete_recent_record_is_insufficient_data() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    store.add_child("child-1", "Niño demo")
    prediction_at = datetime(2026, 8, 26, 12, tzinfo=UTC)
    store.add_daily_record("child-1", _record(prediction_at - timedelta(hours=1), "reparador", "tranquilo_alegre", "estable_con_apoyo"))

    prediction = PredictionService(store).evaluate_current("child-1", prediction_at=prediction_at)

    assert prediction["status"] == "INSUFFICIENT_DATA"
    assert prediction["risk"] is None


def test_baseline_uses_last_14_valid_days_before_recent_window() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    store.add_child("child-1", "Niño demo")
    prediction_at = datetime(2026, 8, 26, 12, tzinfo=UTC)

    for day in range(3):
        store.add_daily_record(
            "child-1",
            _record(prediction_at - timedelta(days=25 - day), "interrumpido", "tranquilo_alegre", "estable_con_apoyo"),
        )
    for day in range(14):
        store.add_daily_record(
            "child-1",
            _record(prediction_at - timedelta(days=17 - day), "reparador", "tranquilo_alegre", "estable_con_apoyo"),
        )
    store.add_daily_record(
        "child-1",
        _record(prediction_at - timedelta(days=1), "interrumpido", "irritable_llorando", "desregulacion_frecuente"),
    )

    engine_input = FeatureBuilder(store).build("child-1", prediction_at)

    assert engine_input.derived["sleep_baseline_deviation_14d"] == 1.0


def test_history_days_counts_unique_valid_days_only() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    store.add_child("child-1", "Niño demo")
    prediction_at = datetime(2026, 8, 26, 12, tzinfo=UTC)
    valid_day = prediction_at - timedelta(days=1)
    invalid_day = prediction_at - timedelta(days=2)
    store.add_daily_record("child-1", _record(valid_day, "reparador", "tranquilo_alegre", "estable_con_apoyo"))
    store.add_daily_record("child-1", _record(valid_day + timedelta(hours=1), "interrumpido", "tranquilo_alegre", "estable_con_apoyo"))
    store.add_daily_record(
        "child-1",
        _record(invalid_day, None, None, None, observed_behavior=[], sleep_hours=None),
    )

    engine_input = FeatureBuilder(store).build("child-1", prediction_at)

    assert engine_input.data_quality["history_days"] == 1


def test_synthetic_daily_records_mark_data_quality_without_extending_contract_payload() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    store.add_child("child-1", "Niño demo")
    prediction_at = datetime(2026, 8, 26, 12, tzinfo=UTC)
    store.add_daily_record(
        "child-1",
        _record(prediction_at - timedelta(hours=1), "reparador", "tranquilo_alegre", "estable_con_apoyo"),
        synthetic=True,
    )

    stored_record = store.list_daily_records("child-1", to_at=prediction_at)[0]
    engine_input = FeatureBuilder(store).build("child-1", prediction_at)

    assert "synthetic" not in stored_record
    assert stored_record["_metadata"]["synthetic"] is True
    assert engine_input.data_quality["contains_synthetic_data"] is True


def test_partial_school_record_preserves_latest_valid_family_fields() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    store.add_child("child-1", "Mateo R.")
    prediction_at = datetime(2026, 8, 26, 12, tzinfo=UTC)
    store.add_daily_record(
        "child-1",
        _record(prediction_at - timedelta(hours=2), "interrumpido", "irritable_llorando", "estable_con_apoyo"),
    )
    school_record = _record(
        prediction_at - timedelta(hours=1),
        "desconocido",
        "desconocido",
        "desregulacion_frecuente",
        sleep_hours=None,
        routine_change=True,
        alert_level="alto",
        observed_behavior=["ruido_intenso"],
    )
    school_record["source"] = "SCHOOL"
    school_record["context"] = "SCHOOL"
    school_record["features"]["gastrointestinal_status"] = None
    school_record["features"]["exceptional_event"] = None
    school_record["features"]["sensory_profile_snapshot"] = []
    store.add_daily_record("child-1", school_record)

    engine_input = FeatureBuilder(store).build("child-1", prediction_at)

    assert engine_input.features["sleep_quality"] == "interrumpido"
    assert engine_input.features["wake_state"] == "irritable_llorando"
    assert engine_input.features["regulation_level"] == "desregulacion_frecuente"
    assert engine_input.features["alert_level"] == "alto"
    assert engine_input.features["routine_change"] is True
    assert engine_input.data_quality["sources"] == ["FAMILY", "SCHOOL"]


def _record(
    recorded_at: datetime,
    sleep_quality: str | None,
    wake_state: str | None,
    regulation_level: str | None,
    *,
    sleep_hours: float | None = 8.0,
    routine_change: bool = False,
    alert_level: str = "optimo",
    observed_behavior: list[str] | None = None,
) -> dict[str, object]:
    return {
        "recorded_at": recorded_at.isoformat(),
        "source": "FAMILY",
        "context": "HOME",
        "features": {
            "sleep_quality": sleep_quality,
            "sleep_hours": sleep_hours,
            "wake_state": wake_state,
            "regulation_level": regulation_level,
            "alert_level": alert_level,
            "routine_change": routine_change,
            "gastrointestinal_status": "normal",
            "observed_behavior": ["ruido_intenso"] if observed_behavior is None else observed_behavior,
            "exceptional_event": False,
            "sensory_profile_snapshot": ["hipersensibilidad_auditiva"],
        },
    }


def _engine_input() -> PredictionEngineInput:
    return PredictionEngineInput(
        child_id="child-1",
        prediction_at="2026-08-26T10:00:00+00:00",
        horizon_hours=24,
        features={
            "sleep_quality": None,
            "sleep_hours": None,
            "wake_state": None,
            "regulation_level": None,
            "alert_level": None,
            "routine_change": None,
            "gastrointestinal_status": None,
            "observed_behavior": [],
            "exceptional_event": None,
            "sensory_profile": [],
        },
        derived={
            "sleep_altered_days_3d": 0,
            "sleep_baseline_deviation_14d": None,
            "wake_adverse_days_3d": 0,
            "low_regulation_days_3d": 0,
            "regulation_trend_3d": None,
            "dysregulation_events_7d": 0,
            "days_since_last_dysregulation": None,
            "adverse_factor_count_current": 0,
            "relevant_trigger_exposure": False,
            "alert_outside_optimal": False,
        },
        data_quality={
            "completeness": 0.0,
            "critical_present": 0,
            "critical_total": 3,
            "hours_since_last_record": None,
            "history_days": 0,
            "sources": [],
            "missing_fields": ["sleep_quality"],
            "missing_critical_data": [
                {"field": "sleep_quality", "state": "MISSING"},
                {"field": "wake_state", "state": "MISSING"},
            ],
            "contains_synthetic_data": False,
        },
    )
