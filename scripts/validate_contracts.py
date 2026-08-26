from __future__ import annotations

import json
from pathlib import Path

import yaml


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
        if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
            raise AssertionError(f"{path} must declare JSON Schema draft 2020-12")
        if schema.get("type") != "object":
            raise AssertionError(f"{path} must define an object schema")
        if "title" not in schema:
            raise AssertionError(f"{path} must define a title")


def validate_openapi() -> None:
    path = CONTRACTS / "openapi.yaml"
    with path.open("r", encoding="utf-8") as handle:
        document = yaml.safe_load(handle)
    if not isinstance(document, dict):
        raise AssertionError("contracts/openapi.yaml must contain a YAML object")
    if document.get("openapi") != "3.1.0":
        raise AssertionError("contracts/openapi.yaml must use OpenAPI 3.1.0")
    for key in ("info", "paths"):
        if key not in document:
            raise AssertionError(f"contracts/openapi.yaml missing {key}")
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
