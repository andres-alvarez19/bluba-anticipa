from bluba_predictor import PredictionInput, predict


def test_predictor_bootstrap_returns_insufficient_data_without_risk() -> None:
    prediction = predict(PredictionInput(subject_id="subject-1"))

    assert prediction["status"] == "insufficient_data"
    assert prediction["risk"] is None
    assert prediction["confidence"]["level"] == "low"
    assert prediction["data_quality"]["missing_features"]


def test_predictor_validates_horizon() -> None:
    try:
        predict(PredictionInput(subject_id="subject-1", horizon_hours=0))
    except ValueError as exc:
        assert "horizon_hours" in str(exc)
    else:
        raise AssertionError("expected horizon validation error")
