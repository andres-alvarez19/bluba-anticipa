from datetime import datetime

from bluba_predictor import PredictionEngineInput, predict


def test_predictor_bootstrap_returns_insufficient_data_without_risk() -> None:
    prediction = predict(PredictionEngineInput(child_id="child-1"))

    assert prediction["status"] == "INSUFFICIENT_DATA"
    assert prediction["risk"] is None
    assert prediction["confidence"]["level"] == "LOW"
    assert prediction["data_quality"]["missing_fields"]


def test_predictor_validates_horizon() -> None:
    try:
        predict(PredictionEngineInput(child_id="child-1", horizon_hours=0))
    except ValueError as exc:
        assert "horizon_hours" in str(exc)
    else:
        raise AssertionError("expected horizon validation error")


def test_predictor_sets_window_end_from_prediction_at() -> None:
    prediction = predict(PredictionEngineInput(child_id="child-1", prediction_at="2026-08-26T10:00:00+00:00"))

    prediction_at = datetime.fromisoformat(prediction["prediction_at"])
    window_end_at = datetime.fromisoformat(prediction["window_end_at"])

    assert (window_end_at - prediction_at).total_seconds() == 24 * 60 * 60
