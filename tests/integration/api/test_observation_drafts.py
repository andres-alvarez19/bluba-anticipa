from datetime import UTC, datetime

import pytest
import httpx
from httpx import ASGITransport, AsyncClient

from bluba_api.app import create_app
from bluba_api.services.observation_capture import DEMO_TRANSCRIPTION, TranscriptionService
from bluba_api.services.prediction_service import PredictionService
from bluba_api.store import SqlAlchemyStore
from scripts.seed_demo import CHILD_ID, seed_demo


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


def _store() -> SqlAlchemyStore:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    store.add_child("child-1", "Mateo")
    return store


@pytest.mark.anyio
async def test_text_draft_is_conservative_and_does_not_change_records_or_prediction() -> None:
    store = _store()
    prediction = PredictionService(store).evaluate_current("child-1")
    transport = ASGITransport(app=create_app(store=store))

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/v1/observation-drafts/text",
            json={"child_id": "child-1", "context": "HOME", "text": "Hoy amaneció irritable."},
        )

    assert response.status_code == 201
    draft = response.json()
    assert draft["status"] == "PENDING_CONFIRMATION"
    assert draft["input_type"] == "TEXT"
    assert draft["transcription"] is None
    assert [item["field"] for item in draft["proposed_variables"]] == ["wake_state"]
    assert store.list_daily_records("child-1") == []
    assert store.get_latest_prediction("child-1") == prediction


@pytest.mark.anyio
async def test_text_draft_idempotency_key_does_not_create_duplicate_drafts() -> None:
    store = _store()
    transport = ASGITransport(app=create_app(store=store))
    request = {
        "json": {"child_id": "child-1", "context": "HOME", "text": "Hoy amaneció irritable."},
        "headers": {"Idempotency-Key": "text-draft-attempt-1"},
    }
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        first = await client.post("/v1/observation-drafts/text", **request)
        repeated = await client.post("/v1/observation-drafts/text", **request)
        conflicting = await client.post(
            "/v1/observation-drafts/text",
            json={"child_id": "child-1", "context": "HOME", "text": "Hoy durmió cinco horas."},
            headers=request["headers"],
        )

    assert first.status_code == 201
    assert repeated.status_code == 201
    assert repeated.json()["draft_id"] == first.json()["draft_id"]
    assert conflicting.status_code == 409
    assert set(conflicting.json()) >= {"code", "message"}


@pytest.mark.anyio
async def test_patch_validates_whitelist_and_confirm_persists_provenance_once() -> None:
    store = _store()
    transport = ASGITransport(app=create_app(store=store))
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        created = await client.post(
            "/v1/observation-drafts/text",
            json={
                "child_id": "child-1",
                "context": "HOME",
                "text": "Durmió 5.5 horas y amaneció irritable.",
            },
        )
        draft_id = created.json()["draft_id"]
        invalid = await client.patch(
            f"/v1/observation-drafts/{draft_id}",
            json={"proposed_variables": [{"field": "risk", "value": 1}]},
        )
        patched = await client.patch(
            f"/v1/observation-drafts/{draft_id}",
            json={
                "proposed_variables": [
                    {"field": "sleep_hours", "value": 6.0, "evidence": "corregido por familia", "confidence": 1.0},
                    {"field": "wake_state", "value": "irritable_llorando"},
                ]
            },
        )
        first = await client.post(
            f"/v1/observation-drafts/{draft_id}/confirm",
            json={"recorded_at": "2026-08-30T12:00:00Z", "notes": "Confirmado."},
        )
        repeated = await client.post(f"/v1/observation-drafts/{draft_id}/confirm", json={})

    assert invalid.status_code == 400
    assert patched.status_code == 200
    assert patched.json()["proposed_variables"][0]["value"] == 6.0
    assert first.status_code == 201
    assert repeated.status_code == 201
    assert repeated.json()["record_id"] == first.json()["record_id"]
    records = store.list_daily_records("child-1")
    assert len(records) == 1
    assert records[0]["features"] == {"sleep_hours": 6.0, "wake_state": "irritable_llorando"}
    assert records[0]["provenance"] == "AI_EXTRACTED_HUMAN_CONFIRMED"
    assert records[0]["source_observation"] == {
        "input_type": "TEXT",
        "observation_draft_id": draft_id,
        "source_text": "Durmió 5.5 horas y amaneció irritable.",
    }
    assert store.get_observation_draft(draft_id)["status"] == "CONFIRMED"


@pytest.mark.anyio
async def test_patch_rejects_predictor_only_sensory_profile_field() -> None:
    """Draft edits may only persist fields accepted by the DailyRecord contract."""
    store = _store()
    transport = ASGITransport(app=create_app(store=store))
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        created = await client.post(
            "/v1/observation-drafts/text",
            json={"child_id": "child-1", "context": "HOME", "text": "Hoy amaneció irritable."},
        )
        response = await client.patch(
            f"/v1/observation-drafts/{created.json()['draft_id']}",
            json={"proposed_variables": [{"field": "sensory_profile", "value": ["ruido"]}]},
        )

    assert response.status_code == 400


@pytest.mark.anyio
async def test_audio_demo_transcribes_without_persisting_raw_audio() -> None:
    store = _store()
    transport = ASGITransport(app=create_app(store=store, transcription_service=TranscriptionService(mode="demo")))
    raw_audio = b"not-real-audio-private-bytes"

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/v1/observation-drafts/audio",
            data={"child_id": "child-1", "context": "HOME", "mime_type": "audio/webm"},
            files={"audio": ("observation.webm", raw_audio, "audio/webm")},
        )

    assert response.status_code == 201
    draft = response.json()
    assert draft["source_text"] is None
    assert draft["transcription"] == DEMO_TRANSCRIPTION
    assert raw_audio.decode() not in repr(store.get_observation_draft(draft["draft_id"]))
    assert {item["field"] for item in draft["proposed_variables"]} == {
        "sleep_hours", "sleep_quality", "wake_state", "routine_change", "observed_behavior"
    }


@pytest.mark.anyio
async def test_provider_mode_fails_explicitly_and_only_uses_enabled_fallback() -> None:
    failing_store = _store()
    fallback_store = _store()
    failing = ASGITransport(
        app=create_app(store=failing_store, transcription_service=TranscriptionService(mode="provider", demo_fallback=False))
    )
    fallback = ASGITransport(
        app=create_app(store=fallback_store, transcription_service=TranscriptionService(mode="provider", demo_fallback=True))
    )
    request = {
        "data": {"child_id": "child-1", "context": "HOME"},
        "files": {"audio": ("note.webm", b"audio", "audio/webm")},
    }
    async with AsyncClient(transport=failing, base_url="http://testserver") as client:
        unavailable = await client.post("/v1/observation-drafts/audio", **request)
    async with AsyncClient(transport=fallback, base_url="http://testserver") as client:
        recovered = await client.post("/v1/observation-drafts/audio", **request)

    assert unavailable.status_code == 500
    assert set(unavailable.json()) >= {"code", "message"}
    assert unavailable.json()["code"] == "TRANSCRIPTION_UNAVAILABLE"
    assert "provider failed" in unavailable.json()["message"]
    assert failing_store.list_daily_records("child-1") == []
    assert recovered.status_code == 201
    assert recovered.json()["transcription"] == DEMO_TRANSCRIPTION
    assert fallback_store.observation_draft_is_synthetic(recovered.json()["draft_id"]) is True


@pytest.mark.anyio
async def test_provider_posts_multipart_and_demo_audio_marks_confirmed_record_synthetic() -> None:
    requests: list[httpx.Request] = []

    def provider(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(200, json={"transcription": "Hoy amaneció irritable."})

    provider_store = _store()
    provider_service = TranscriptionService(
        mode="provider",
        provider_url="https://transcriber.test/v1/audio",
        provider_token="secret-token",
        transport=httpx.MockTransport(provider),
    )
    provider_transport = ASGITransport(
        app=create_app(store=provider_store, transcription_service=provider_service)
    )
    async with AsyncClient(transport=provider_transport, base_url="http://testserver") as client:
        provider_response = await client.post(
            "/v1/observation-drafts/audio",
            data={"child_id": "child-1", "context": "HOME", "mime_type": "audio/webm"},
            files={"audio": ("note.webm", b"private-audio", "audio/webm")},
        )

    assert provider_response.status_code == 201
    assert provider_response.json()["transcription"] == "Hoy amaneció irritable."
    assert provider_store.observation_draft_is_synthetic(provider_response.json()["draft_id"]) is False
    assert requests[0].headers["authorization"] == "Bearer secret-token"
    assert "multipart/form-data" in requests[0].headers["content-type"]

    demo_store = _store()
    demo_transport = ASGITransport(
        app=create_app(store=demo_store, transcription_service=TranscriptionService(mode="demo"))
    )
    async with AsyncClient(transport=demo_transport, base_url="http://testserver") as client:
        draft = await client.post(
            "/v1/observation-drafts/audio",
            data={"child_id": "child-1", "context": "HOME"},
            files={"audio": ("note.webm", b"audio", "audio/webm")},
        )
        confirmed = await client.post(f"/v1/observation-drafts/{draft.json()['draft_id']}/confirm", json={})

    assert confirmed.status_code == 201
    assert demo_store.list_daily_records("child-1")[0]["_metadata"]["synthetic"] is True


@pytest.mark.anyio
async def test_audio_idempotency_replays_before_calling_provider_again() -> None:
    calls = 0

    def provider(_request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(200, json={"text": "Hoy amaneció irritable."})

    store = _store()
    service = TranscriptionService(
        mode="provider",
        provider_url="https://transcriber.test/audio",
        transport=httpx.MockTransport(provider),
    )
    transport = ASGITransport(app=create_app(store=store, transcription_service=service))
    request = {
        "headers": {"Idempotency-Key": "audio-key-0001"},
        "data": {"child_id": "child-1", "context": "HOME"},
        "files": {"audio": ("note.webm", b"same-audio", "audio/webm")},
    }
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        first = await client.post("/v1/observation-drafts/audio", **request)
        replay = await client.post("/v1/observation-drafts/audio", **request)

    assert first.status_code == 201
    assert replay.json()["draft_id"] == first.json()["draft_id"]
    assert calls == 1


@pytest.mark.anyio
async def test_capture_framework_validation_is_problem_details_with_400() -> None:
    store = _store()
    transport = ASGITransport(app=create_app(store=store))
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        missing_fields = await client.post("/v1/observation-drafts/audio", files={})
        invalid_key = await client.post(
            "/v1/observation-drafts/text",
            headers={"Idempotency-Key": "short"},
            json={"child_id": "child-1", "context": "HOME", "text": "Observación"},
        )

    assert missing_fields.status_code == 400
    assert missing_fields.json()["code"] == "INVALID_CAPTURE_REQUEST"
    assert missing_fields.json()["field_errors"]
    assert invalid_key.status_code == 400
    assert invalid_key.json()["code"] == "INVALID_IDEMPOTENCY_KEY"


@pytest.mark.anyio
async def test_confirmation_same_key_with_different_payload_conflicts() -> None:
    store = _store()
    transport = ASGITransport(app=create_app(store=store))
    headers = {"Idempotency-Key": "confirm-key-002"}
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        draft = await client.post(
            "/v1/observation-drafts/text",
            json={"child_id": "child-1", "context": "HOME", "text": "Hoy amaneció irritable."},
        )
        url = f"/v1/observation-drafts/{draft.json()['draft_id']}/confirm"
        first = await client.post(url, headers=headers, json={"notes": "primera"})
        conflict = await client.post(url, headers=headers, json={"notes": "distinta"})

    assert first.status_code == 201
    assert conflict.status_code == 409
    assert conflict.json()["code"] == "IDEMPOTENCY_CONFLICT"


@pytest.mark.anyio
async def test_confirmation_retry_recalculates_after_transient_prediction_failure(monkeypatch: pytest.MonkeyPatch) -> None:
    store = _store()
    original_evaluate = PredictionService.evaluate_current
    calls = 0

    def fail_once(service: PredictionService, child_id: str, prediction_at: datetime | None = None) -> dict:
        nonlocal calls
        calls += 1
        if calls == 1:
            raise RuntimeError("transient predictor failure")
        return original_evaluate(service, child_id, prediction_at)

    monkeypatch.setattr(PredictionService, "evaluate_current", fail_once)
    transport = ASGITransport(app=create_app(store=store), raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        created = await client.post(
            "/v1/observation-drafts/text",
            json={"child_id": "child-1", "context": "HOME", "text": "Hoy amaneció irritable."},
        )
        draft_id = created.json()["draft_id"]
        first = await client.post(f"/v1/observation-drafts/{draft_id}/confirm", json={})
        retried = await client.post(f"/v1/observation-drafts/{draft_id}/confirm", json={})

    assert first.status_code == 500
    assert retried.status_code == 201
    assert calls == 2
    assert len(store.list_daily_records("child-1")) == 1
    assert store.get_latest_prediction("child-1") is not None


@pytest.mark.anyio
async def test_draft_errors_are_semantic_and_confirmation_recalculates_real_prediction() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    seed_demo(store, today=datetime(2026, 8, 30, 8, tzinfo=UTC))
    transport = ASGITransport(app=create_app(store=store))
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        before = await client.get(f"/v1/children/{CHILD_ID}/risk-predictions/current")
        missing = await client.patch("/v1/observation-drafts/missing", json={"proposed_variables": []})
        bad_text = await client.post(
            "/v1/observation-drafts/text", json={"child_id": CHILD_ID, "context": "HOME", "text": " "}
        )
        draft = await client.post(
            "/v1/observation-drafts/text",
            json={"child_id": CHILD_ID, "context": "HOME", "text": DEMO_TRANSCRIPTION},
        )
        confirmed = await client.post(
            f"/v1/observation-drafts/{draft.json()['draft_id']}/confirm",
            json={"recorded_at": "2026-08-30T12:00:00Z"},
        )
        after = await client.get(f"/v1/children/{CHILD_ID}/risk-predictions/current")

    assert missing.status_code == 404
    assert bad_text.status_code == 400
    assert confirmed.status_code == 201
    assert before.json()["risk"]["level"] == "MEDIUM"
    assert after.json()["risk"]["level"] == "HIGH"
    assert before.json()["prediction_id"] != after.json()["prediction_id"]
