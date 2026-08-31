from datetime import UTC, datetime

from bluba_api.store import SqlAlchemyStore
from bluba_predictor import PredictionEngineInput, predict


def demo_daily_record() -> dict[str, object]:
    return {
        "recorded_at": datetime.now(UTC).isoformat(),
        "source": "FAMILY",
        "context": "HOME",
        "features": {
            "sleep_quality": None,
            "sleep_hours": None,
            "wake_state": "desconocido",
            "regulation_level": None,
            "alert_level": "desconocido",
            "routine_change": None,
            "gastrointestinal_status": None,
            "observed_behavior": [],
            "exceptional_event": None,
            "sensory_profile_snapshot": [],
        },
        "notes": "Registro demo con datos criticos faltantes.",
    }


def test_repository_persists_child_daily_record_and_latest_prediction() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()

    child = store.add_child("child-1", "Niño demo")
    record = store.add_daily_record("child-1", demo_daily_record())
    prediction = predict(_engine_input(store.latest_features("child-1")))
    store.set_latest_prediction("child-1", prediction)

    assert store.list_children() == [child]
    assert record["child_id"] == "child-1"
    assert store.latest_features("child-1")["wake_state"] == "desconocido"
    assert store.get_latest_prediction("child-1") == prediction


def test_repository_orders_records_by_actual_instant_not_iso_offset_text() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    store.add_child("child-1", "Niño demo")

    later = demo_daily_record()
    later["recorded_at"] = "2026-08-26T10:00:00-04:00"
    later["features"] = {**later["features"], "wake_state": "irritable_llorando"}
    earlier = demo_daily_record()
    earlier["recorded_at"] = "2026-08-26T13:00:00+00:00"
    earlier["features"] = {**earlier["features"], "wake_state": "tranquilo_alegre"}
    store.add_daily_record("child-1", later)
    store.add_daily_record("child-1", earlier)

    records = store.list_daily_records("child-1", to_at=datetime(2026, 8, 26, 15, tzinfo=UTC))

    assert [record["features"]["wake_state"] for record in records] == ["tranquilo_alegre", "irritable_llorando"]


def test_repository_deletes_observation_drafts_only_for_requested_child() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    store.add_child("child-1", "Niño uno")
    store.add_child("child-2", "Niño dos")
    base_draft = {
        "context": "HOME",
        "input_type": "TEXT",
        "source_text": "Observación de prueba",
        "transcription": None,
        "proposed_variables": [{"field": "wake_state", "value": "irritable_llorando"}],
        "status": "PENDING_CONFIRMATION",
        "expires_at": None,
    }
    store.add_observation_draft({**base_draft, "draft_id": "draft-1", "child_id": "child-1"})
    store.add_observation_draft({**base_draft, "draft_id": "draft-2", "child_id": "child-2"})

    store.delete_observation_drafts("child-1")

    assert store.get_observation_draft("draft-1") is None
    assert store.get_observation_draft("draft-2") is not None


def _engine_input(features: dict[str, object]) -> PredictionEngineInput:
    return PredictionEngineInput(
        child_id="child-1",
        prediction_at="2026-08-26T10:00:00+00:00",
        horizon_hours=24,
        features={
            "sleep_quality": features.get("sleep_quality"),
            "sleep_hours": features.get("sleep_hours"),
            "wake_state": features.get("wake_state"),
            "regulation_level": features.get("regulation_level"),
            "alert_level": features.get("alert_level"),
            "routine_change": features.get("routine_change"),
            "gastrointestinal_status": features.get("gastrointestinal_status"),
            "observed_behavior": list(features.get("observed_behavior") or []),
            "exceptional_event": features.get("exceptional_event"),
            "sensory_profile": list(features.get("sensory_profile") or features.get("sensory_profile_snapshot") or []),
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
