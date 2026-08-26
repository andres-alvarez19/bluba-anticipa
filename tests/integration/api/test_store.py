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
            "sensory_profile": [],
        },
        "notes": "Registro demo con datos criticos faltantes.",
    }


def test_repository_persists_child_daily_record_and_latest_prediction() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()

    child = store.add_child("child-1", "Niño demo")
    record = store.add_daily_record("child-1", demo_daily_record())
    prediction = predict(PredictionEngineInput(child_id="child-1", features=store.latest_features("child-1")))
    store.set_latest_prediction("child-1", prediction)

    assert store.list_children() == [child]
    assert record["child_id"] == "child-1"
    assert store.latest_features("child-1")["wake_state"] == "desconocido"
    assert store.get_latest_prediction("child-1") == prediction
