from __future__ import annotations

import copy
import json
from pathlib import Path

from bluba_predictor import predict
from scripts.eval_current_risk import FIXTURE_DIR, evaluate_fixture
from tests.model.test_predictor import _input


def test_risk_and_confidence_are_independent_dimensions() -> None:
    high_quality = _input()
    lower_quality = _input(data_quality={"history_days": 7, "hours_since_last_record": 70, "sources": ["FAMILY"]})

    high_quality_prediction = predict(high_quality)
    lower_quality_prediction = predict(lower_quality)

    assert high_quality_prediction["risk"]["score"] == lower_quality_prediction["risk"]["score"]
    assert high_quality_prediction["confidence"]["score"] != lower_quality_prediction["confidence"]["score"]

    stable = predict(_input())
    adverse = predict(_input(derived={"sleep_altered_days_3d": 3}))

    assert stable["confidence"]["score"] == adverse["confidence"]["score"]
    assert stable["risk"]["score"] != adverse["risk"]["score"]


def test_current_risk_eval_outputs_are_deterministic_except_prediction_id() -> None:
    fixture = _load_fixture("gradual-deterioration")

    _, first = evaluate_fixture(fixture)
    _, second = evaluate_fixture(fixture)

    assert first["model_version"] == second["model_version"]
    assert first["feature_schema_version"] == second["feature_schema_version"]
    assert first["risk"] == second["risk"]
    assert first["confidence"] == second["confidence"]
    assert [factor["code"] for factor in first["top_factors"]] == [factor["code"] for factor in second["top_factors"]]


def test_future_data_leakage_fixture_matches_same_history_without_future_data() -> None:
    fixture = _load_fixture("future-data-leakage")
    without_future = copy.deepcopy(fixture)
    without_future["history"] = [
        record for record in fixture["history"] if record["recorded_at"] <= fixture["prediction_at"]
    ]
    without_future["events"] = []

    _, with_future_output = evaluate_fixture(fixture)
    _, without_future_output = evaluate_fixture(without_future)

    assert with_future_output["risk"] == without_future_output["risk"]
    assert with_future_output["confidence"] == without_future_output["confidence"]
    assert [factor["code"] for factor in with_future_output["top_factors"]] == [
        factor["code"] for factor in without_future_output["top_factors"]
    ]


def test_routine_change_fixture_increases_risk_against_identical_non_routine_case() -> None:
    fixture = _load_fixture("routine-change")
    without_routine = copy.deepcopy(fixture)
    without_routine["history"][-1]["features"]["routine_change"] = False

    _, routine_output = evaluate_fixture(fixture)
    _, baseline_output = evaluate_fixture(without_routine)

    assert routine_output["risk"]["score"] >= baseline_output["risk"]["score"]


def _load_fixture(scenario_id: str) -> dict[str, object]:
    path = Path(FIXTURE_DIR) / f"{scenario_id}.json"
    with path.open(encoding="utf-8") as file:
        return json.load(file)
