import json
from datetime import UTC, datetime, timedelta
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient
from jsonschema import Draft202012Validator

from bluba_api.app import create_app
from bluba_api.services.prediction_service import PredictionService
from bluba_api.store import SqlAlchemyStore
from scripts.seed_demo import CHILD_ID, seed_demo


ROOT = Path(__file__).resolve().parents[3]


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest.mark.anyio
async def test_api_vertical_slice_returns_current_prediction_from_persistence() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    transport = ASGITransport(app=create_app(store=store))

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        session = await client.post("/v1/auth/session", json={"role": "FAMILY"})
        children = await client.get("/v1/children")
        child_id = children.json()[0]["id"]
        daily_record = await client.post(
            f"/v1/children/{child_id}/daily-records",
            json={
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
            },
        )
        prediction = await client.get(f"/v1/children/{child_id}/risk-predictions/current")

    assert session.status_code == 200
    assert session.json()["role"] == "FAMILY"
    assert children.status_code == 200
    assert children.json()[0]["display_name"] == "Mateo R."
    assert daily_record.status_code == 201
    assert prediction.status_code == 200
    assert prediction.json()["status"] == "INSUFFICIENT_DATA"
    assert prediction.json()["risk"] is None
    assert prediction.json()["confidence"]["level"] == "LOW"


@pytest.mark.anyio
async def test_api_vertical_slice_returns_seeded_current_prediction_and_persists_it() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    seed_demo(store, today=datetime(2026, 8, 26, 8, tzinfo=UTC))
    transport = ASGITransport(app=create_app(store=store))

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        prediction = await client.get(f"/v1/children/{CHILD_ID}/risk-predictions/current")

    payload = prediction.json()
    assert prediction.status_code == 200
    assert payload["status"] in {"OK", "LOW_CONFIDENCE"}
    assert payload["risk"] is not None
    assert payload["confidence"] is not None
    assert payload["top_factors"]
    assert store.get_latest_prediction(CHILD_ID) == payload


def test_seed_demo_is_idempotent_for_logical_scenario_and_risk_band() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    today = datetime(2026, 8, 26, 8, tzinfo=UTC)

    seed_demo(store, today=today)
    first_records = store.list_daily_records(CHILD_ID)
    first_prediction = PredictionService(store).evaluate_current(CHILD_ID, prediction_at=today)
    store.add_event(
        CHILD_ID,
        {
            "occurred_at": today.isoformat(),
            "event_type": "DYSREGULATION",
            "context": "HOME",
        },
    )
    store.add_observation_draft(
        {
            "draft_id": "draft-from-previous-demo-run",
            "child_id": CHILD_ID,
            "context": "HOME",
            "input_type": "TEXT",
            "source_text": "Texto sensible de una ejecución anterior.",
            "transcription": None,
            "proposed_variables": [{"field": "wake_state", "value": "irritable_llorando"}],
            "status": "PENDING_CONFIRMATION",
            "expires_at": None,
        }
    )
    seed_demo(store, today=today)
    second_records = store.list_daily_records(CHILD_ID)
    assert store.get_latest_prediction(CHILD_ID) is None
    assert store.list_dysregulation_events(CHILD_ID) == []
    assert store.get_observation_draft("draft-from-previous-demo-run") is None
    second_prediction = PredictionService(store).evaluate_current(CHILD_ID, prediction_at=today)

    assert len(first_records) == 17
    assert len(second_records) == 17
    assert len({record["recorded_at"] for record in second_records}) == 17
    assert [record["recorded_at"] for record in first_records] == [record["recorded_at"] for record in second_records]
    assert first_prediction["risk"]["level"] == second_prediction["risk"]["level"]


@pytest.mark.anyio
async def test_demo_video_flow_transitions_from_medium_to_high_with_school_evidence() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    now = datetime.now(UTC)
    anchor_date = now if now.hour >= 8 else now - timedelta(days=1)
    seed_demo(store, today=anchor_date.replace(hour=8, minute=0, second=0, microsecond=0))
    transport = ASGITransport(app=create_app(store=store))

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        before_response = await client.get(f"/v1/children/{CHILD_ID}/risk-predictions/current")
        report_response = await client.post(
            f"/v1/children/{CHILD_ID}/daily-records",
            json={
                "recorded_at": datetime.now(UTC).isoformat(),
                "source": "SCHOOL",
                "context": "SCHOOL",
                "provenance": "HUMAN_STRUCTURED",
                "features": {
                    "sleep_quality": "desconocido",
                    "sleep_hours": None,
                    "wake_state": "desconocido",
                    "regulation_level": "desregulacion_frecuente",
                    "alert_level": "alto",
                    "routine_change": True,
                    "gastrointestinal_status": None,
                    "observed_behavior": ["ruido_intenso", "sobrecarga_sensorial"],
                    "exceptional_event": None,
                    "sensory_profile": [],
                },
                "notes": "Sobrecarga por ruido durante una transición escolar.",
            },
        )
        after_response = await client.get(f"/v1/children/{CHILD_ID}/risk-predictions/current")

    before = before_response.json()
    after = after_response.json()
    validator = Draft202012Validator(_load_prediction_schema())

    assert before_response.status_code == 200
    assert report_response.status_code == 201
    assert after_response.status_code == 200
    assert not list(validator.iter_errors(before))
    assert not list(validator.iter_errors(after))
    assert before["risk"]["level"] == "MEDIUM"
    assert after["risk"]["level"] == "HIGH"
    assert before["prediction_id"] != after["prediction_id"]
    assert before["prediction_at"] != after["prediction_at"]
    assert "SCHOOL" not in before["data_quality"]["sources"]
    assert "SCHOOL" in after["data_quality"]["sources"]
    assert store.list_daily_records(CHILD_ID)[-1]["source"] == "SCHOOL"
    assert store.get_latest_prediction(CHILD_ID) == after


def _load_prediction_schema() -> dict[str, object]:
    with (ROOT / "contracts" / "prediction.schema.json").open(encoding="utf-8") as schema_file:
        return json.load(schema_file)
