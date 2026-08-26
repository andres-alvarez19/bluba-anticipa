from __future__ import annotations

import json
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator
from openapi_spec_validator import validate_spec


ROOT = Path(__file__).resolve().parents[1]
CONTRACTS = ROOT / "contracts"


def _load_json(path: Path) -> object:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _walk_refs(value: object) -> list[str]:
    refs: list[str] = []
    if isinstance(value, dict):
        ref = value.get("$ref")
        if isinstance(ref, str):
            refs.append(ref)
        for nested in value.values():
            refs.extend(_walk_refs(nested))
    elif isinstance(value, list):
        for nested in value:
            refs.extend(_walk_refs(nested))
    return refs


def validate_json_schemas() -> None:
    for path in sorted(CONTRACTS.glob("*.schema.json")):
        schema = _load_json(path)
        if not isinstance(schema, dict):
            raise AssertionError(f"{path} must contain a JSON object")
        Draft202012Validator.check_schema(schema)


def validate_openapi() -> None:
    path = CONTRACTS / "openapi.yaml"
    with path.open("r", encoding="utf-8") as handle:
        document = yaml.safe_load(handle)
    if not isinstance(document, dict):
        raise AssertionError("contracts/openapi.yaml must contain a YAML object")
    if document.get("openapi") != "3.1.0":
        raise AssertionError("contracts/openapi.yaml must use OpenAPI 3.1.0")
    validate_spec(document)
    for ref in _walk_refs(document):
        if ref.startswith("./"):
            target = CONTRACTS / ref[2:]
            if not target.exists():
                raise AssertionError(f"OpenAPI reference does not exist: {ref}")


def main() -> None:
    validate_json_schemas()
    validate_openapi()
    print("contracts ok")


if __name__ == "__main__":
    main()
