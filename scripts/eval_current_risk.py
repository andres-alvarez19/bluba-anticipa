from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator

from bluba_api.services.feature_builder import FeatureBuilder
from bluba_api.store import SqlAlchemyStore
from bluba_predictor import PredictionEngineInput, PredictionEngineOutput, predict


ROOT = Path(__file__).resolve().parents[1]
FIXTURE_DIR = ROOT / "evals" / "model" / "current-risk"
PREDICTION_SCHEMA_PATH = ROOT / "contracts" / "prediction.schema.json"


@dataclass(frozen=True)
class EvalResult:
    scenario_id: str
    passed: bool
    status: str
    risk_level: str
    confidence_level: str
    factor_codes: list[str]
    errors: list[str]


def main() -> int:
    parser = argparse.ArgumentParser(description="Run current-risk behavioral evals.")
    parser.add_argument("--database-url", default="sqlite+pysqlite:///:memory:")
    args = parser.parse_args()

    results = run_evals(args.database_url)
    _print_results(results)
    return 0 if all(result.passed for result in results) else 1


def run_evals(database_url: str = "sqlite+pysqlite:///:memory:") -> list[EvalResult]:
    schema = _load_json(PREDICTION_SCHEMA_PATH)
    contract_validator = Draft202012Validator(schema)
    fixtures = [_load_json(path) for path in sorted(FIXTURE_DIR.glob("*.json"))]
    results = []
    for fixture in fixtures:
        results.append(_run_fixture(fixture, database_url, contract_validator))
    return results


def evaluate_fixture(fixture: dict[str, Any], database_url: str = "sqlite+pysqlite:///:memory:") -> tuple[PredictionEngineInput, PredictionEngineOutput]:
    store = _store_for_fixture(fixture, database_url)
    engine_input = FeatureBuilder(store).build(fixture["child_id"], _parse_datetime(fixture["prediction_at"]))
    return engine_input, predict(engine_input)


def _run_fixture(
    fixture: dict[str, Any],
    database_url: str,
    contract_validator: Draft202012Validator,
) -> EvalResult:
    errors = []
    engine_input, output = evaluate_fixture(fixture, database_url)
    errors.extend(_schema_errors(contract_validator, _dataclass_to_dict(engine_input), "PredictionEngineInput"))
    errors.extend(_schema_errors(contract_validator, output, "PredictionEngineOutput"))
    errors.extend(_expectation_errors(fixture, output))
    return EvalResult(
        scenario_id=fixture["scenario_id"],
        passed=not errors,
        status=output["status"],
        risk_level=output["risk"]["level"] if output["risk"] else "null",
        confidence_level=output["confidence"]["level"],
        factor_codes=[factor["code"] for factor in output["top_factors"]],
        errors=errors,
    )


def _store_for_fixture(fixture: dict[str, Any], database_url: str) -> SqlAlchemyStore:
    store = SqlAlchemyStore(database_url)
    if database_url == "sqlite+pysqlite:///:memory:":
        store.create_schema()
    child_id = fixture["child_id"]
    store.add_child(child_id, "Eval synthetic child")
    store.delete_daily_records(child_id)
    for record in fixture.get("history", []):
        store.add_daily_record(child_id, record, synthetic=True)
    for event in fixture.get("events", []):
        store.add_event(child_id, event)
    return store


def _expectation_errors(fixture: dict[str, Any], output: PredictionEngineOutput) -> list[str]:
    expected = fixture["expected"]
    errors = []
    if output["status"] not in _expected_values(expected["status"]):
        errors.append(f"status {output['status']} not in {expected['status']}")
    if expected.get("risk_null") is True and output["risk"] is not None:
        errors.append("risk expected null")
    if expected.get("risk_null") is False and output["risk"] is None:
        errors.append("risk expected non-null")
    if output["risk"] and "risk_level" in expected and output["risk"]["level"] not in _expected_values(expected["risk_level"]):
        errors.append(f"risk level {output['risk']['level']} not in {expected['risk_level']}")
    if "confidence_level" in expected and output["confidence"]["level"] not in _expected_values(expected["confidence_level"]):
        errors.append(f"confidence level {output['confidence']['level']} not in {expected['confidence_level']}")
    factors = [factor["code"] for factor in output["top_factors"]]
    missing_factors = sorted(set(expected.get("required_factor_codes", [])) - set(factors))
    if missing_factors:
        errors.append(f"missing factor codes: {', '.join(missing_factors)}")
    return errors


def _schema_errors(validator: Draft202012Validator, payload: dict[str, Any], label: str) -> list[str]:
    return [f"{label} schema: {'/'.join(str(part) for part in error.path)} {error.message}" for error in validator.iter_errors(payload)]


def _expected_values(value: Any) -> list[Any]:
    return value if isinstance(value, list) else [value]


def _dataclass_to_dict(payload: PredictionEngineInput) -> dict[str, Any]:
    return {
        "child_id": payload.child_id,
        "prediction_at": payload.prediction_at,
        "horizon_hours": payload.horizon_hours,
        "features": payload.features,
        "derived": payload.derived,
        "data_quality": payload.data_quality,
    }


def _load_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as file:
        return json.load(file)


def _parse_datetime(value: str) -> Any:
    from bluba_api.store import parse_domain_datetime

    return parse_domain_datetime(value)


def _print_results(results: list[EvalResult]) -> None:
    print("Scenario                 Status             Risk    Confidence  Factors")
    print("--------------------------------------------------------------------------")
    for result in results:
        marker = "PASS" if result.passed else "FAIL"
        factors = ",".join(result.factor_codes) or "-"
        print(f"{result.scenario_id:24} {result.status:18} {result.risk_level:7} {result.confidence_level:11} {factors} [{marker}]")
        for error in result.errors:
            print(f"  - {error}")


if __name__ == "__main__":
    raise SystemExit(main())
