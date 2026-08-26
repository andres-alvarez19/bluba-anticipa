from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from bluba_predictor import PredictionEngineInput, predict

from .store import SqlAlchemyStore


DEMO_CHILD = {"id": "child-demo-1", "display_name": "Niño demo", "relationship_contexts": ["HOME"]}


def create_app() -> Any:
    try:
        from fastapi import FastAPI, HTTPException
    except ModuleNotFoundError as exc:
        raise RuntimeError("FastAPI is required to create the API app. Run 'make setup'.") from exc

    app = FastAPI(title="Bluba Anticipa API", version="0.1.0")
    store = SqlAlchemyStore()
    store.create_schema()

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/v1/auth/session")
    def create_demo_session(body: dict[str, Any]) -> dict[str, Any]:
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
    def get_my_context() -> dict[str, Any]:
        return {
            "user_id": "demo-user-family",
            "role": "FAMILY",
            "children": [DEMO_CHILD],
            "classrooms": [],
            "permissions": ["children:read", "daily-records:create", "predictions:read"],
        }

    @app.get("/v1/children")
    def list_authorized_children() -> list[dict[str, Any]]:
        return [DEMO_CHILD]

    @app.post("/v1/children/{child_id}/daily-records", status_code=201)
    def create_daily_record(child_id: str, record: dict[str, Any]) -> dict[str, Any]:
        response = store.add_daily_record(child_id, record)
        prediction = predict(PredictionEngineInput(child_id=child_id, features=store.latest_features(child_id)))
        store.set_latest_prediction(child_id, prediction)
        return response

    @app.post("/v1/internal/ml/predictions")
    def create_prediction(body: dict[str, Any] | None = None) -> dict[str, Any]:
        body = body or {}
        child_id = body.get("child_id")
        if not child_id:
            raise HTTPException(status_code=400, detail="child_id is required")
        horizon_hours = int((body or {}).get("horizon_hours", 24))
        prediction = predict(
            PredictionEngineInput(
                child_id=child_id,
                horizon_hours=horizon_hours,
                features=dict(body.get("features") or store.latest_features(child_id)),
                derived=dict(body.get("derived") or {}),
                data_quality=dict(body.get("data_quality") or {}),
            )
        )
        store.set_latest_prediction(child_id, prediction)
        return prediction

    @app.get("/v1/children/{child_id}/risk-predictions/current")
    def get_current_risk_prediction(child_id: str) -> dict[str, Any]:
        prediction = store.get_latest_prediction(child_id)
        if prediction is None:
            prediction = predict(PredictionEngineInput(child_id=child_id, features=store.latest_features(child_id)))
            store.set_latest_prediction(child_id, prediction)
        return prediction

    @app.get("/v1/children/{child_id}/preventive-status")
    def get_preventive_status(child_id: str) -> dict[str, Any]:
        now = datetime.now(UTC).isoformat()
        prediction = get_current_risk_prediction(child_id)
        return {
            "child_id": child_id,
            "generated_at": now,
            "prediction": prediction,
            "baseline": {
                "child_id": child_id,
                "status": "BUILDING",
                "valid_days": 0,
                "reference_window_days": 14,
                "cutoff_at": now,
                "metrics": [],
            },
            "recommendations": [],
            "disclaimer": "Estimación preventiva de apoyo; no corresponde a un diagnóstico.",
        }

    @app.post("/v1/children/{child_id}/events", status_code=201)
    def create_event(child_id: str, event: dict[str, Any]) -> dict[str, Any]:
        return store.add_event(child_id, event)

    return app
