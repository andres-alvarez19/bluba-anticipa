from __future__ import annotations

import json
from pathlib import Path

from jsonschema import Draft202012Validator

from scripts.eval_current_risk import FIXTURE_DIR, evaluate_fixture
from scripts.seed_demo import _baseline_features, _recent_features


ROOT = Path(__file__).resolve().parents[2]


def test_current_risk_eval_payloads_validate_against_prediction_schema() -> None:
    validator = Draft202012Validator(_load_schema("prediction.schema.json"))

    for fixture_path in sorted(FIXTURE_DIR.glob("*.json")):
        fixture = _load_json(fixture_path)
        engine_input, output = evaluate_fixture(fixture)

        assert not list(validator.iter_errors(_engine_input_dict(engine_input))), fixture["scenario_id"]
        assert not list(validator.iter_errors(output)), fixture["scenario_id"]


def test_synthetic_daily_records_validate_against_daily_record_schema() -> None:
    validator = Draft202012Validator(_load_schema("daily-record.schema.json"))

    for fixture_path in sorted(FIXTURE_DIR.glob("*.json")):
        fixture = _load_json(fixture_path)
        for record in fixture["history"]:
            assert "scenario_id" not in record
            assert "synthetic" not in record
            assert not list(validator.iter_errors(record)), fixture["scenario_id"]

    for features in [_baseline_features(), _recent_features(16)]:
        record = {
            "recorded_at": "2026-08-26T08:00:00+00:00",
            "source": "FAMILY",
            "context": "HOME",
            "features": features,
            "notes": "Synthetic schema test.",
        }
        assert "synthetic" not in record
        assert not list(validator.iter_errors(record))


def _engine_input_dict(engine_input) -> dict[str, object]:
    return {
        "child_id": engine_input.child_id,
        "prediction_at": engine_input.prediction_at,
        "horizon_hours": engine_input.horizon_hours,
        "features": engine_input.features,
        "derived": engine_input.derived,
        "data_quality": engine_input.data_quality,
    }


def _load_schema(name: str) -> dict[str, object]:
    return _load_json(ROOT / "contracts" / name)


def _load_json(path: Path) -> dict[str, object]:
    with path.open(encoding="utf-8") as file:
        return json.load(file)
