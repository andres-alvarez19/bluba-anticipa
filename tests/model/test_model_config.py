from __future__ import annotations

import copy
import json
from pathlib import Path

import pytest

from bluba_predictor import ConfidenceLevel, FactorCode, RiskLevel
from bluba_predictor.config import (
    MODEL_CONFIG_PATH,
    ModelConfigError,
    load_model_config,
    resolve_confidence_level,
    resolve_risk_level,
)
from bluba_predictor.engine import _risk_score
from bluba_predictor.normalization import normalize_prediction_input
from tests.model.test_predictor import _input


RISK_KEYS = {
    "sleep_altered_days_3d",
    "sleep_baseline_deviation_14d",
    "wake_adverse_days_3d",
    "low_regulation_days_3d",
    "regulation_trend_3d",
    "dysregulation_events_7d",
    "adverse_factor_count_current",
    "relevant_trigger_exposure",
    "alert_outside_optimal",
    "routine_change",
}


def test_model_version_is_baseline_demo_v1() -> None:
    config = load_model_config()

    assert config.model_version == "baseline-demo-v1"
    assert config.horizon_hours == 24


@pytest.mark.parametrize(
    ("score", "expected"),
    [
        (0.0, RiskLevel.LOW),
        (0.349999, RiskLevel.LOW),
        (0.35, RiskLevel.MEDIUM),
        (0.649999, RiskLevel.MEDIUM),
        (0.65, RiskLevel.HIGH),
        (1.0, RiskLevel.HIGH),
    ],
)
def test_risk_threshold_boundaries(score: float, expected: RiskLevel) -> None:
    assert resolve_risk_level(score, load_model_config()) is expected


@pytest.mark.parametrize(
    ("score", "expected"),
    [
        (0.0, ConfidenceLevel.LOW),
        (0.3999, ConfidenceLevel.LOW),
        (0.4, ConfidenceLevel.LOW),
        (0.549999, ConfidenceLevel.LOW),
        (0.55, ConfidenceLevel.MEDIUM),
        (0.799999, ConfidenceLevel.MEDIUM),
        (0.8, ConfidenceLevel.HIGH),
        (1.0, ConfidenceLevel.HIGH),
    ],
)
def test_confidence_threshold_boundaries(score: float, expected: ConfidenceLevel) -> None:
    assert resolve_confidence_level(score, load_model_config()) is expected


def test_thresholds_cover_zero_to_one() -> None:
    config = load_model_config()

    for thresholds in (config.risk_levels, config.confidence_levels):
        assert thresholds.low.minimum == 0.0
        assert thresholds.high.maximum == 1.0
        assert not thresholds.high.maximum_exclusive


def test_thresholds_do_not_overlap() -> None:
    config = load_model_config()

    for thresholds in (config.risk_levels, config.confidence_levels):
        low, medium, high = thresholds.ordered()
        assert low.maximum == medium.minimum
        assert medium.maximum == high.minimum
        assert low.maximum_exclusive
        assert medium.maximum_exclusive


def test_minimum_prediction_score_leaves_reachable_low_confidence_band() -> None:
    config = load_model_config()

    assert config.confidence_scoring.minimum_score_for_prediction == 0.4
    assert config.confidence_scoring.minimum_score_for_prediction < config.confidence_levels.low.maximum


def test_invalid_threshold_gap_rejected(tmp_path: Path) -> None:
    raw = _raw_config()
    raw["risk_levels"]["MEDIUM"]["min"] = 0.4

    with pytest.raises(ModelConfigError, match="gap"):
        load_model_config(_write_config(tmp_path, raw))


def test_invalid_threshold_overlap_rejected(tmp_path: Path) -> None:
    raw = _raw_config()
    raw["risk_levels"]["MEDIUM"]["min"] = 0.3

    with pytest.raises(ModelConfigError, match="overlap"):
        load_model_config(_write_config(tmp_path, raw))


@pytest.mark.parametrize("score", [-0.000001, 1.000001])
def test_invalid_score_rejected(score: float) -> None:
    config = load_model_config()

    with pytest.raises(ModelConfigError, match="between zero and one"):
        resolve_risk_level(score, config)


def test_minimum_data_config() -> None:
    minimum = load_model_config().minimum_data

    assert minimum.critical_groups_total == 3
    assert minimum.minimum_critical_groups_present == 2
    assert minimum.max_record_age_hours == 72


def test_minimum_critical_groups_do_not_exceed_total() -> None:
    config = load_model_config()

    assert config.minimum_data.minimum_critical_groups_present <= config.minimum_data.critical_groups_total


def test_windows_config() -> None:
    windows = load_model_config().windows

    assert windows.accumulators_hours == 72
    assert windows.event_history_days == 7
    assert windows.baseline_provisional_min_valid_days == 7
    assert windows.baseline_target_valid_days == 14


@pytest.mark.parametrize(
    ("path", "value", "message"),
    [
        (("model_version",), "", "model_version"),
        (("horizon_hours",), 12, "horizon_hours"),
        (("windows", "accumulators_hours"), 0, "accumulators_hours"),
        (("windows", "event_history_days"), 8, "event_history_days"),
        (("windows", "baseline_provisional_min_valid_days"), 6, "baseline_provisional_min_valid_days"),
        (("windows", "baseline_target_valid_days"), 13, "baseline_target_valid_days"),
        (("minimum_data", "critical_groups_total"), 0, "critical_groups_total"),
        (("minimum_data", "minimum_critical_groups_present"), 4, "cannot exceed"),
        (("minimum_data", "max_record_age_hours"), -1, "max_record_age_hours"),
    ],
)
def test_invalid_base_config_rejected(
    tmp_path: Path,
    path: tuple[str, ...],
    value: object,
    message: str,
) -> None:
    raw = _raw_config()
    target = raw
    for key in path[:-1]:
        target = target[key]
    target[path[-1]] = value

    with pytest.raises(ModelConfigError, match=message):
        load_model_config(_write_config(tmp_path, raw))


def test_temporary_scoring_config_remains_semantically_consistent() -> None:
    config = load_model_config()

    assert set(config.risk_scoring.weights) == RISK_KEYS
    assert set(config.factor_mappings) == RISK_KEYS
    assert all(weight >= 0 for weight in config.risk_scoring.weights.values())
    assert {mapping.code for mapping in config.factor_mappings.values()} <= set(FactorCode)
    _risk_score(normalize_prediction_input(_input()), config)


def _raw_config() -> dict:
    with MODEL_CONFIG_PATH.open(encoding="utf-8") as config_file:
        return copy.deepcopy(json.load(config_file))


def _write_config(tmp_path: Path, raw: dict) -> Path:
    path = tmp_path / "model.json"
    path.write_text(json.dumps(raw), encoding="utf-8")
    return path
