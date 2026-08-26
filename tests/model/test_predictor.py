from bluba_predictor import PredictionInput, predict


def test_predictor_bootstrap_returns_insufficient_data_without_risk() -> None:
    prediction = predict(PredictionInput(child_id="child-1"))

    assert prediction["status"] == "INSUFFICIENT_DATA"
    assert prediction["risk"] is None
    assert prediction["confidence"]["level"] == "LOW"
    assert prediction["data_quality"]["missing_fields"]


def test_predictor_validates_horizon() -> None:
    try:
        predict(PredictionInput(child_id="child-1", horizon_hours=0))
    except ValueError as exc:
        assert "horizon_hours" in str(exc)
    else:
        raise AssertionError("expected horizon validation error")
