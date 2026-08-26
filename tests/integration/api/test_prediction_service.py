from bluba_api.services.prediction_service import to_risk_prediction
from bluba_predictor import PredictionEngineInput, predict


def test_adapter_maps_prediction_engine_output_to_risk_prediction() -> None:
    output = predict(PredictionEngineInput(child_id="child-1", prediction_at="2026-08-26T10:00:00+00:00"))

    prediction = to_risk_prediction(output)

    assert prediction["prediction_id"] == output["prediction_id"]
    assert prediction["child_id"] == "child-1"
    assert prediction["status"] == "INSUFFICIENT_DATA"
    assert prediction["risk"] is None
    assert prediction["confidence"]["level"] == "LOW"
