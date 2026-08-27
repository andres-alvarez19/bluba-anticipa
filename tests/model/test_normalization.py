from __future__ import annotations

from dataclasses import replace

import pytest

from bluba_predictor.normalization import (
    AlertLevel,
    NormalizationError,
    RecordSource,
    SleepQuality,
    WakeState,
    normalize_prediction_input,
)
from tests.model.test_predictor import _input


def test_normalizes_canonical_representation_without_changing_semantics() -> None:
    normalized = normalize_prediction_input(
        _input(
            features={
                "sleep_quality": " REPARADOR ",
                "wake_state": " Tranquilo Alegre ",
                "alert_level": "OPTIMO",
                "gastrointestinal_status": " Dolor Abdominal ",
                "observed_behavior": [" juego_funcional "],
            },
            data_quality={"sources": [" family ", "SCHOOL"]},
        )
    )

    assert normalized.features.sleep_quality is SleepQuality.REPARADOR
    assert normalized.features.wake_state is WakeState.TRANQUILO_ALEGRE
    assert normalized.features.alert_level is AlertLevel.OPTIMO
    assert normalized.features.gastrointestinal_status == "dolor_abdominal"
    assert normalized.features.observed_behavior == ("juego_funcional",)
    assert normalized.data_quality.sources == (RecordSource.FAMILY, RecordSource.SCHOOL)


def test_preserves_none_as_distinct_from_explicit_unknown() -> None:
    absent = normalize_prediction_input(_input(features={"sleep_quality": None}))
    unknown = normalize_prediction_input(_input(features={"sleep_quality": "desconocido"}))

    assert absent.features.sleep_quality is None
    assert unknown.features.sleep_quality is SleepQuality.UNKNOWN


def test_gastrointestinal_status_is_open_vocabulary() -> None:
    normalized = normalize_prediction_input(_input(features={"gastrointestinal_status": "Nausea Persistente"}))

    assert normalized.features.gastrointestinal_status == "nausea_persistente"


def test_data_quality_optional_contract_fields_receive_canonical_defaults() -> None:
    payload = replace(
        _input(),
        data_quality={
            "completeness": 0.75,
            "history_days": 7,
            "sources": ["FAMILY"],
            "missing_fields": [],
        },
    )

    normalized = normalize_prediction_input(payload)

    assert normalized.data_quality.critical_present is None
    assert normalized.data_quality.critical_total is None
    assert normalized.data_quality.hours_since_last_record is None
    assert normalized.data_quality.missing_critical_data == ()
    assert normalized.data_quality.contains_synthetic_data is False


def test_rejects_non_contractual_feature_aliases() -> None:
    payload = _input()
    payload.features["calidad_sueno"] = payload.features.pop("sleep_quality")

    with pytest.raises(NormalizationError, match="features is missing required fields: sleep_quality"):
        normalize_prediction_input(payload)


def test_rejects_unknown_closed_enum_value() -> None:
    with pytest.raises(NormalizationError, match="features.sleep_quality"):
        normalize_prediction_input(_input(features={"sleep_quality": "bien"}))


def test_rejects_extra_derived_fields_from_dataset_extensions() -> None:
    payload = _input()
    payload.derived["routine_changes_3d"] = 1

    with pytest.raises(NormalizationError, match="derived contains unsupported fields"):
        normalize_prediction_input(payload)
