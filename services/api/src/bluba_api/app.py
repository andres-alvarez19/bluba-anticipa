from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from .services.prediction_service import PredictionService
from .store import SqlAlchemyStore


def create_app(store: SqlAlchemyStore | None = None) -> Any:
    try:
        from fastapi import FastAPI, HTTPException
    except ModuleNotFoundError as exc:
        raise RuntimeError("FastAPI is required to create the API app. Run 'make setup'.") from exc

    app = FastAPI(title="Bluba Anticipa API", version="0.1.0")
    repository = store or SqlAlchemyStore()
    prediction_service = PredictionService(repository)
    repository.ensure_demo_child()

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
