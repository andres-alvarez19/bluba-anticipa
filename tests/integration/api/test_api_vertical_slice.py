from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from bluba_api.app import create_app
from bluba_api.store import SqlAlchemyStore


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
                    "sensory_profile": [],
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
