from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from bluba_api.app import create_app
from bluba_api.services.prediction_service import PredictionService
from bluba_api.store import SqlAlchemyStore
from scripts.seed_demo import CHILD_ID, seed_demo


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
    assert children.json()[0]["display_name"] == "Niño demo"
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
    seed_demo(store, today=today)
    second_records = store.list_daily_records(CHILD_ID)
    second_prediction = PredictionService(store).evaluate_current(CHILD_ID, prediction_at=today)

    assert len(first_records) == 17
    assert len(second_records) == 17
    assert len({record["recorded_at"] for record in second_records}) == 17
    assert [record["recorded_at"] for record in first_records] == [record["recorded_at"] for record in second_records]
    assert first_prediction["risk"]["level"] == second_prediction["risk"]["level"]
