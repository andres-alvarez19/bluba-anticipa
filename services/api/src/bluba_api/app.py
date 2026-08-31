from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any

from .services.observation_capture import (
    ALLOWED_CONTEXTS,
    CaptureUnavailableError,
    ObservationDraftService,
    ObservationExtractionService,
    TranscriptionService,
    validate_proposed_variables,
)
from .services.prediction_service import PredictionService
from .store import IdempotencyConflictError, SqlAlchemyStore, parse_domain_datetime


class CaptureProblem(Exception):
    def __init__(self, status_code: int, code: str, message: str, field_errors: list[dict[str, str]] | None = None) -> None:
        self.status_code = status_code
        self.problem = {"code": code, "message": message, "field_errors": field_errors or []}
        super().__init__(message)


def create_app(
    store: SqlAlchemyStore | None = None,
    *,
    transcription_service: TranscriptionService | None = None,
    extraction_service: ObservationExtractionService | None = None,
) -> Any:
    try:
        from fastapi import FastAPI, File, Form, Header, HTTPException
        from fastapi.exception_handlers import request_validation_exception_handler
        from fastapi.exceptions import RequestValidationError
        from fastapi.responses import JSONResponse
    except ModuleNotFoundError as exc:
        raise RuntimeError("FastAPI is required to create the API app. Run 'make setup'.") from exc

    app = FastAPI(title="Bluba Anticipa API", version="0.1.0")
    repository = store or SqlAlchemyStore()
    prediction_service = PredictionService(repository)
    transcriber = transcription_service or TranscriptionService()
    draft_service = ObservationDraftService(repository, extraction_service)
    repository.ensure_demo_child()

    @app.exception_handler(CaptureProblem)
    async def capture_problem_handler(_request: Any, exc: CaptureProblem) -> Any:
        return JSONResponse(status_code=exc.status_code, content=exc.problem)

    @app.exception_handler(RequestValidationError)
    async def validation_problem_handler(request: Any, exc: Any) -> Any:
        if not request.url.path.startswith("/v1/observation-drafts"):
            return await request_validation_exception_handler(request, exc)
        field_errors = [
            {"field": ".".join(str(part) for part in error["loc"][1:]), "message": error["msg"]}
            for error in exc.errors()
        ]
        return JSONResponse(
            status_code=400,
            content={"code": "INVALID_CAPTURE_REQUEST", "message": "La solicitud de captura no es válida.", "field_errors": field_errors},
        )

    @app.post("/v1/auth/session")
    async def create_demo_session(body: dict[str, Any]) -> dict[str, Any]:
        role = body.get("role")
        if role not in {"FAMILY", "EDUCATOR", "PROFESSIONAL"}:
            raise HTTPException(status_code=400, detail="invalid role")
        return {
            "access_token": f"demo-token-{role.lower()}",
            "token_type": "Bearer",
            "expires_in_seconds": 3600,
            "user_id": f"demo-user-{role.lower()}",
            "role": role,
        }

    @app.get("/v1/me/context")
    async def get_my_context() -> dict[str, Any]:
        return {
            "user_id": "demo-user-family",
            "role": "FAMILY",
            "children": repository.list_children(),
            "classrooms": [],
            "permissions": ["children:read", "daily-records:create", "predictions:read"],
        }

    @app.get("/v1/children")
    async def list_authorized_children() -> list[dict[str, Any]]:
        return repository.list_children()

    @app.post("/v1/children/{childId}/daily-records", status_code=201)
    async def create_daily_record(childId: str, record: dict[str, Any]) -> dict[str, Any]:
        response = repository.add_daily_record(childId, record)
        prediction_service.evaluate_current(childId)
        return response

    @app.post("/v1/observation-drafts/text", status_code=201)
    async def create_text_observation_draft(
        body: dict[str, Any],
        idempotency_key: str | None = Header(None, alias="Idempotency-Key"),
    ) -> dict[str, Any]:
        _validate_idempotency_key(idempotency_key)
        if set(body) != {"child_id", "context", "text"}:
            raise CaptureProblem(400, "INVALID_TEXT_OBSERVATION", "child_id, context and text are the only accepted fields")
        child_id = body.get("child_id")
        context = body.get("context")
        text = body.get("text")
        if not isinstance(child_id, str) or not child_id or not repository.child_exists(child_id):
            raise CaptureProblem(404, "CHILD_NOT_FOUND", "child not found")
        if context not in ALLOWED_CONTEXTS:
            raise CaptureProblem(400, "INVALID_CONTEXT", "invalid context")
        if not isinstance(text, str) or not 1 <= len(text.strip()) <= 4000:
            raise CaptureProblem(400, "INVALID_TEXT", "text must contain between 1 and 4000 characters")
        normalized = {"child_id": child_id, "context": context, "text": text.strip()}
        fingerprint = _fingerprint("create-text", normalized)
        replay = _replay_draft(repository, idempotency_key, fingerprint)
        if replay is not None:
            return replay
        try:
            return await draft_service.create(
                child_id=child_id,
                context=context,
                input_type="TEXT",
                text=text.strip(),
                idempotency_key=idempotency_key,
                idempotency_fingerprint=fingerprint,
            )
        except IdempotencyConflictError as exc:
            raise CaptureProblem(409, "IDEMPOTENCY_CONFLICT", str(exc)) from exc

    @app.post("/v1/observation-drafts/audio", status_code=201)
    async def create_audio_observation_draft(
        child_id: str = Form(...),
        context: str = Form(...),
        audio: bytes = File(...),
        mime_type: str | None = Form(None),
        idempotency_key: str | None = Header(None, alias="Idempotency-Key"),
    ) -> dict[str, Any]:
        _validate_idempotency_key(idempotency_key)
        if not repository.child_exists(child_id):
            raise CaptureProblem(404, "CHILD_NOT_FOUND", "child not found")
        if context not in ALLOWED_CONTEXTS:
            raise CaptureProblem(400, "INVALID_CONTEXT", "invalid context")
        if not audio:
            raise CaptureProblem(400, "EMPTY_AUDIO", "audio must not be empty")
        if len(audio) > 10 * 1024 * 1024:
            raise CaptureProblem(400, "AUDIO_TOO_LARGE", "audio exceeds the 10 MiB demo limit")
        fingerprint = _fingerprint(
            "create-audio",
            {
                "child_id": child_id,
                "context": context,
                "mime_type": mime_type,
                "audio_sha256": hashlib.sha256(audio).hexdigest(),
            },
        )
        replay = _replay_draft(repository, idempotency_key, fingerprint)
        if replay is not None:
            return replay
        try:
            transcription = await transcriber.transcribe(audio, mime_type)
        except ValueError as exc:
            raise CaptureProblem(400, "INVALID_AUDIO", str(exc)) from exc
        except CaptureUnavailableError as exc:
            raise CaptureProblem(500, "TRANSCRIPTION_UNAVAILABLE", str(exc)) from exc
        try:
            return await draft_service.create(
                child_id=child_id,
                context=context,
                input_type="AUDIO",
                text=transcription.text,
                synthetic=transcription.synthetic,
                idempotency_key=idempotency_key,
                idempotency_fingerprint=fingerprint,
            )
        except IdempotencyConflictError as exc:
            raise CaptureProblem(409, "IDEMPOTENCY_CONFLICT", str(exc)) from exc

    @app.patch("/v1/observation-drafts/{draftId}")
    async def patch_observation_draft(draftId: str, body: dict[str, Any]) -> dict[str, Any]:
        if set(body) != {"proposed_variables"}:
            raise CaptureProblem(400, "INVALID_DRAFT_PATCH", "proposed_variables is the only accepted field")
        try:
            proposed_variables = validate_proposed_variables(body.get("proposed_variables"))
            draft = repository.update_observation_draft(draftId, proposed_variables)
        except ValueError as exc:
            status = 409 if str(exc) == "draft is not pending confirmation" else 400
            raise CaptureProblem(status, "DRAFT_NOT_PENDING" if status == 409 else "INVALID_PROPOSED_VARIABLE", str(exc)) from exc
        if draft is None:
            raise CaptureProblem(404, "DRAFT_NOT_FOUND", "observation draft not found")
        return draft

    @app.post("/v1/observation-drafts/{draftId}/confirm", status_code=201)
    async def confirm_observation_draft(
        draftId: str,
        body: dict[str, Any] | None = None,
        idempotency_key: str | None = Header(None, alias="Idempotency-Key"),
    ) -> dict[str, Any]:
        _validate_idempotency_key(idempotency_key)
        body = body or {}
        if set(body) - {"recorded_at", "notes"}:
            raise CaptureProblem(400, "INVALID_CONFIRMATION", "recorded_at and notes are the only accepted fields")
        confirmation_fingerprint = _fingerprint("confirm", body)
        notes = body.get("notes")
        if notes is not None and (not isinstance(notes, str) or len(notes) > 2000):
            raise CaptureProblem(400, "INVALID_NOTES", "notes must be a string up to 2000 characters or null")
        recorded_at = body.get("recorded_at") or datetime.now(UTC).isoformat()
        if not isinstance(recorded_at, str):
            raise CaptureProblem(400, "INVALID_RECORDED_AT", "recorded_at must be an ISO 8601 date-time")
        try:
            parsed = parse_domain_datetime(recorded_at)
            recorded_at = parsed.isoformat()
        except (TypeError, ValueError) as exc:
            raise CaptureProblem(400, "INVALID_RECORDED_AT", "recorded_at must be an ISO 8601 date-time") from exc
        draft = repository.get_observation_draft(draftId)
        if draft is None:
            raise CaptureProblem(404, "DRAFT_NOT_FOUND", "observation draft not found")
        if draft["status"] == "PENDING_CONFIRMATION" and not draft["proposed_variables"]:
            raise CaptureProblem(400, "EMPTY_DRAFT", "at least one proposed variable is required to confirm")
        try:
            confirmation = repository.confirm_observation_draft(
                draftId,
                recorded_at=recorded_at,
                notes=notes,
                idempotency_key=idempotency_key,
                idempotency_fingerprint=confirmation_fingerprint,
            )
        except IdempotencyConflictError as exc:
            raise CaptureProblem(409, "IDEMPOTENCY_CONFLICT", str(exc)) from exc
        except ValueError as exc:
            if str(exc) == "draft is not pending confirmation":
                raise CaptureProblem(409, "DRAFT_NOT_PENDING", str(exc)) from exc
            raise
        if confirmation is None:
            raise CaptureProblem(404, "DRAFT_NOT_FOUND", "observation draft not found")
        response, child_id, _created = confirmation
        try:
            prediction_service.evaluate_current(child_id)
        except Exception as exc:
            raise CaptureProblem(
                500,
                "PREDICTION_RECALCULATION_FAILED",
                "The record was persisted but prediction recalculation failed; retry confirmation.",
            ) from exc
        return response

    @app.get("/v1/children/{childId}/risk-predictions/current")
    async def get_current_risk_prediction(childId: str) -> dict[str, Any]:
        return prediction_service.latest_or_evaluate(childId)

    @app.get("/v1/children/{childId}/preventive-status")
    async def get_preventive_status(childId: str) -> dict[str, Any]:
        now = datetime.now(UTC).isoformat()
        prediction = prediction_service.latest_or_evaluate(childId)
        return {
            "child_id": childId,
            "generated_at": now,
            "prediction": prediction,
            "baseline": {
                "child_id": childId,
                "status": "BUILDING",
                "valid_days": 0,
                "reference_window_days": 14,
                "cutoff_at": now,
                "metrics": [],
            },
            "recommendations": [],
            "disclaimer": "Estimación preventiva de apoyo; no corresponde a un diagnóstico.",
        }

    @app.post("/v1/children/{childId}/dysregulation-events", status_code=201)
    async def create_dysregulation_event(childId: str, event: dict[str, Any]) -> dict[str, Any]:
        return repository.add_event(childId, event)

    return app


def _validate_idempotency_key(value: str | None) -> None:
    if value is not None and not 8 <= len(value) <= 128:
        raise CaptureProblem(
            400,
            "INVALID_IDEMPOTENCY_KEY",
            "Idempotency-Key must contain between 8 and 128 characters.",
            [{"field": "Idempotency-Key", "message": "invalid length"}],
        )


def _fingerprint(operation: str, payload: dict[str, Any]) -> str:
    canonical = json.dumps({"operation": operation, "payload": payload}, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _replay_draft(
    repository: SqlAlchemyStore,
    idempotency_key: str | None,
    fingerprint: str,
) -> dict[str, Any] | None:
    if idempotency_key is None:
        return None
    try:
        return repository.replay_observation_draft(idempotency_key, fingerprint)
    except IdempotencyConflictError as exc:
        raise CaptureProblem(409, "IDEMPOTENCY_CONFLICT", str(exc)) from exc
