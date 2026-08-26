from datetime import datetime

from bluba_predictor import PredictionEngineInput, predict


def test_predictor_bootstrap_returns_insufficient_data_without_risk() -> None:
    prediction = predict(PredictionEngineInput(child_id="child-1"))

    assert prediction["status"] == "INSUFFICIENT_DATA"
    assert prediction["risk"] is None
    assert prediction["confidence"]["level"] == "LOW"
    assert prediction["data_quality"]["missing_fields"]


def test_predictor_returns_demo_risk_with_explanatory_factors() -> None:
    prediction = predict(
        PredictionEngineInput(
            child_id="child-1",
            prediction_at="2026-08-26T10:00:00+00:00",
            features={"routine_change": True},
            derived={
                "sleep_altered_days_3d": 3,
                "sleep_baseline_deviation_14d": 1.0,
                "wake_adverse_days_3d": 2,
                "low_regulation_days_3d": 1,
                "regulation_trend_3d": -0.25,
                "dysregulation_events_7d": 0,
                "days_since_last_dysregulation": None,
                "adverse_factor_count_current": 5,
                "relevant_trigger_exposure": True,
                "alert_outside_optimal": True,
            },
            data_quality={
                "completeness": 1.0,
                "critical_present": 3,
                "critical_total": 3,
                "hours_since_last_record": 2,
                "history_days": 17,
                "sources": ["FAMILY"],
                "missing_fields": [],
                "missing_critical_data": [],
                "contains_synthetic_data": True,
            },
        )
    )

    assert prediction["status"] == "OK"
    assert prediction["risk"] is not None
    assert prediction["risk"]["level"] in {"MEDIUM", "HIGH"}
    assert prediction["top_factors"]
    assert prediction["confidence"]["level"] == "HIGH"


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
