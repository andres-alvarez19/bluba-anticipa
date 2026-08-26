from __future__ import annotations

from typing import Any

from bluba_predictor import PredictionEngineInput, PredictionEngineOutput, predict

from bluba_api.store import SqlAlchemyStore


RiskPrediction = dict[str, Any]


def to_risk_prediction(output: PredictionEngineOutput) -> RiskPrediction:
    return {
        "prediction_id": output["prediction_id"],
        "child_id": output["child_id"],
        "prediction_at": output["prediction_at"],
        "window_end_at": output["window_end_at"],
        "horizon_hours": output["horizon_hours"],
        "model_version": output["model_version"],
        "feature_schema_version": output["feature_schema_version"],
        "status": output["status"],
        "risk": output["risk"],
        "confidence": output["confidence"],
        "top_factors": output["top_factors"],
        "data_quality": output["data_quality"],
        "warnings": output["warnings"],
        "required_fields": output["required_fields"],
    }


class PredictionService:
    def __init__(self, store: SqlAlchemyStore) -> None:
        self.store = store

    def evaluate_current(self, child_id: str) -> RiskPrediction:
        output = predict(PredictionEngineInput(child_id=child_id, features=self.store.latest_features(child_id)))
        prediction = to_risk_prediction(output)
        self.store.set_latest_prediction(child_id, prediction)
        return prediction

    def latest_or_evaluate(self, child_id: str) -> RiskPrediction:
        prediction = self.store.get_latest_prediction(child_id)
        if prediction is not None:
            return prediction
        return self.evaluate_current(child_id)
