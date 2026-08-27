from datetime import datetime

import bluba_predictor.engine as engine
from bluba_predictor import FactorCode, PredictionEngineInput, PredictionEngineOutput, predict


def test_public_api_is_preserved() -> None:
    assert PredictionEngineInput.__name__ == "PredictionEngineInput"
    assert PredictionEngineOutput.__name__ == "PredictionEngineOutput"
    assert callable(predict)


def test_predict_is_deterministic_except_for_prediction_id() -> None:
    first = predict(_input())
    second = predict(_input())

    first_without_id = {key: value for key, value in first.items() if key != "prediction_id"}
    second_without_id = {key: value for key, value in second.items() if key != "prediction_id"}
    assert first_without_id == second_without_id


def test_predictor_bootstrap_returns_insufficient_data_without_risk() -> None:
    prediction = predict(
        _input(
            features={"sleep_quality": None, "sleep_hours": None, "wake_state": None, "regulation_level": None},
            data_quality={
                "completeness": 0.0,
                "critical_present": 0,
                "hours_since_last_record": None,
                "history_days": 0,
                "sources": [],
                "missing_fields": ["sleep_quality", "wake_state", "regulation_level"],
                "missing_critical_data": [
                    {"field": "sleep_quality", "state": "MISSING"},
                    {"field": "wake_state", "state": "MISSING"},
                    {"field": "regulation_level", "state": "MISSING"},
                ],
            },
        )
    )

    assert prediction["status"] == "INSUFFICIENT_DATA"
    assert prediction["risk"] is None
    assert prediction["confidence"]["level"] == "LOW"
    assert prediction["data_quality"]["missing_fields"]


def test_predictor_returns_demo_risk_with_explanatory_factors() -> None:
    prediction = predict(
        PredictionEngineInput(
            child_id="child-1",
            prediction_at="2026-08-26T10:00:00+00:00",
            horizon_hours=24,
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
                "sources": ["FAMILY", "SCHOOL"],
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
        predict(_input(horizon_hours=0))
    except ValueError as exc:
        assert "horizon_hours" in str(exc)
    else:
        raise AssertionError("expected horizon validation error")


def test_predictor_sets_window_end_from_prediction_at() -> None:
    prediction = predict(_input(prediction_at="2026-08-26T10:00:00+00:00"))

    prediction_at = datetime.fromisoformat(prediction["prediction_at"])
    window_end_at = datetime.fromisoformat(prediction["window_end_at"])

    assert (window_end_at - prediction_at).total_seconds() == 24 * 60 * 60


def test_worsening_regulation_trend_increases_risk_and_can_explain() -> None:
    stable = predict(_input(derived={"regulation_trend_3d": 0.0}))
    worsening = predict(_input(derived={"regulation_trend_3d": -0.5}))

    assert stable["risk"] is not None
    assert worsening["risk"] is not None
    assert worsening["risk"]["score"] > stable["risk"]["score"]
    assert any(factor["code"] == FactorCode.REGULATION_TREND_3D for factor in worsening["top_factors"])


def test_no_baseline_and_no_interpretable_recent_trend_is_insufficient_data() -> None:
    prediction = predict(_input(derived={"regulation_trend_3d": None}, data_quality={"history_days": 1}))

    assert prediction["status"] == "INSUFFICIENT_DATA"
    assert prediction["risk"] is None


def test_interpretable_recent_trend_allows_low_history_when_confidence_is_sufficient() -> None:
    prediction = predict(_input(derived={"regulation_trend_3d": -0.1}, data_quality={"history_days": 1}))

    assert prediction["risk"] is not None


def test_seven_valid_history_days_make_baseline_available_without_recent_trend() -> None:
    prediction = predict(_input(derived={"regulation_trend_3d": None}, data_quality={"history_days": 7}))

    assert prediction["risk"] is not None


def test_six_valid_history_days_keep_baseline_unavailable_without_recent_trend() -> None:
    prediction = predict(_input(derived={"regulation_trend_3d": None}, data_quality={"history_days": 6}))

    assert prediction["status"] == "INSUFFICIENT_DATA"
    assert prediction["risk"] is None


def test_baseline_availability_is_provisional_until_fourteen_days() -> None:
    day_7 = predict(_input(derived={"regulation_trend_3d": None}, data_quality={"history_days": 7}))
    day_13 = predict(_input(derived={"regulation_trend_3d": None}, data_quality={"history_days": 13}))
    day_14 = predict(_input(derived={"regulation_trend_3d": None}, data_quality={"history_days": 14}))

    assert day_7["risk"] is not None
    assert day_13["risk"] is not None
    assert day_14["risk"] is not None
    assert day_7["confidence"]["score"] < day_13["confidence"]["score"] < day_14["confidence"]["score"]


def test_natural_low_confidence_prediction_returns_risk() -> None:
    prediction = predict(
        _input(
            data_quality={
                "critical_present": 2,
                "hours_since_last_record": 70,
                "history_days": 7,
                "sources": ["FAMILY"],
            }
        )
    )

    assert prediction["confidence"]["score"] == 0.4722
    assert prediction["confidence"]["level"] == "LOW"
    assert prediction["status"] == "LOW_CONFIDENCE"
    assert prediction["risk"] is not None


def test_confidence_gate_boundary_statuses(monkeypatch) -> None:
    def force_confidence(score: float) -> None:
        monkeypatch.setattr(engine, "_confidence_score", lambda data_quality, config: score)

    force_confidence(0.3999)
    below_minimum = predict(_input())

    force_confidence(0.4)
    at_minimum = predict(_input())

    force_confidence(0.5499)
    below_medium = predict(_input())

    force_confidence(0.55)
    at_medium = predict(_input())

    force_confidence(0.8)
    at_high = predict(_input())

    assert below_minimum["status"] == "INSUFFICIENT_DATA"
    assert below_minimum["risk"] is None
    assert at_minimum["status"] == "LOW_CONFIDENCE"
    assert at_minimum["risk"] is not None
    assert at_minimum["confidence"]["level"] == "LOW"
    assert below_medium["status"] == "LOW_CONFIDENCE"
    assert below_medium["confidence"]["level"] == "LOW"
    assert at_medium["status"] == "OK"
    assert at_medium["confidence"]["level"] == "MEDIUM"
    assert at_high["status"] == "OK"
    assert at_high["confidence"]["level"] == "HIGH"


def test_adverse_magnitudes_are_monotonic_for_baseline_model() -> None:
    cases = [
        ("derived", "sleep_altered_days_3d", 0, 1),
        ("derived", "sleep_baseline_deviation_14d", 0.0, 0.5),
        ("derived", "wake_adverse_days_3d", 0, 1),
        ("derived", "low_regulation_days_3d", 0, 1),
        ("derived", "regulation_trend_3d", 0.0, -0.5),
        ("derived", "dysregulation_events_7d", 0, 1),
        ("derived", "adverse_factor_count_current", 0, 1),
        ("derived", "relevant_trigger_exposure", False, True),
        ("derived", "alert_outside_optimal", False, True),
        ("features", "routine_change", False, True),
    ]

    for section, key, low, high in cases:
        baseline = predict(_input(**{section: {key: low}}))
        adverse = predict(_input(**{section: {key: high}}))

        assert baseline["risk"] is not None, key
        assert adverse["risk"] is not None, key
        assert adverse["risk"]["score"] >= baseline["risk"]["score"], key


def _input(
    *,
    prediction_at: str = "2026-08-26T10:00:00+00:00",
    horizon_hours: int = 24,
    features: dict[str, object] | None = None,
    derived: dict[str, object] | None = None,
    data_quality: dict[str, object] | None = None,
) -> PredictionEngineInput:
    base_features = {
        "sleep_quality": "reparador",
        "sleep_hours": 8.0,
        "wake_state": "tranquilo_alegre",
        "regulation_level": "estable_con_apoyo",
        "alert_level": "optimo",
        "routine_change": False,
        "gastrointestinal_status": "normal",
        "observed_behavior": ["juego_funcional"],
        "exceptional_event": False,
        "sensory_profile": ["hipersensibilidad_auditiva"],
    }
    base_derived = {
        "sleep_altered_days_3d": 0,
        "sleep_baseline_deviation_14d": 0.0,
        "wake_adverse_days_3d": 0,
        "low_regulation_days_3d": 0,
        "regulation_trend_3d": 0.0,
        "dysregulation_events_7d": 0,
        "days_since_last_dysregulation": None,
        "adverse_factor_count_current": 0,
        "relevant_trigger_exposure": False,
        "alert_outside_optimal": False,
    }
    base_data_quality = {
        "completeness": 1.0,
        "critical_present": 3,
        "critical_total": 3,
        "hours_since_last_record": 2,
        "history_days": 14,
        "sources": ["FAMILY", "SCHOOL"],
        "missing_fields": [],
        "missing_critical_data": [],
        "contains_synthetic_data": False,
    }
    base_features.update(features or {})
    base_derived.update(derived or {})
    base_data_quality.update(data_quality or {})
    return PredictionEngineInput(
        child_id="child-1",
        prediction_at=prediction_at,
        horizon_hours=horizon_hours,
        features=base_features,
        derived=base_derived,
        data_quality=base_data_quality,
    )
