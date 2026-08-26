from __future__ import annotations

from typing import Any

from bluba_predictor import PredictionInput, predict

from .store import InMemoryStore


store = InMemoryStore()


def create_app() -> Any:
    try:
        from fastapi import FastAPI, HTTPException
    except ModuleNotFoundError as exc:
        raise RuntimeError("FastAPI is required to create the API app. Run 'make setup'.") from exc

    app = FastAPI(title="Bluba Anticipa API", version="0.1.0")

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/daily-records", status_code=201)
    def create_daily_record(record: dict[str, Any]) -> dict[str, Any]:
        store.add_daily_record(record)
        return record

    @app.post("/subjects/{subject_id}/predictions")
    def create_prediction(subject_id: str, body: dict[str, Any] | None = None) -> dict[str, Any]:
        horizon_hours = int((body or {}).get("horizon_hours", 24))
        observations = store.latest_observations(subject_id)
        prediction = predict(
            PredictionInput(
                subject_id=subject_id,
                horizon_hours=horizon_hours,
                observations=observations,
            )
        )
        store.set_latest_prediction(subject_id, prediction)
        return prediction

    @app.get("/subjects/{subject_id}/predictions/latest")
    def get_latest_prediction(subject_id: str) -> dict[str, Any]:
        prediction = store.get_latest_prediction(subject_id)
        if prediction is None:
            raise HTTPException(status_code=404, detail="No prediction found")
        return prediction

    @app.post("/subjects/{subject_id}/events", status_code=201)
    def create_event(subject_id: str, event: dict[str, Any]) -> dict[str, Any]:
        if event.get("subject_id") != subject_id:
            raise HTTPException(status_code=422, detail="subject_id mismatch")
        store.add_event(event)
        return event

    return app
