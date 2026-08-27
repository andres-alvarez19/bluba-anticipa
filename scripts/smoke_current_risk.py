from __future__ import annotations

import sys
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.eval_current_risk import PREDICTION_SCHEMA_PATH, _load_json  # noqa: E402
from scripts.seed_demo import CHILD_ID, seed_demo  # noqa: E402

from bluba_api.services.prediction_service import PredictionService  # noqa: E402
from bluba_api.store import SqlAlchemyStore  # noqa: E402


def main() -> int:
    store = SqlAlchemyStore()
    if store.database_url == "sqlite+pysqlite:///:memory:":
        store.create_schema()
    seed_demo(store)
    prediction = PredictionService(store).evaluate_current(CHILD_ID)
    errors = list(Draft202012Validator(_load_json(PREDICTION_SCHEMA_PATH)).iter_errors(prediction))
    if errors:
        for error in errors:
            print(f"schema error: {'/'.join(str(part) for part in error.path)} {error.message}")
        return 1
    if prediction["risk"] is None or not prediction["top_factors"]:
        print("smoke failed: expected non-null risk and top factors")
        return 1
    print(
        "smoke current risk ok: "
        f"status={prediction['status']} risk={prediction['risk']['level']} "
        f"confidence={prediction['confidence']['level']} factors={len(prediction['top_factors'])}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
