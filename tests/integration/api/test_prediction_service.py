from datetime import UTC, datetime, timedelta

from bluba_api.services.feature_builder import FeatureBuilder
from bluba_api.services.prediction_service import PredictionService, to_risk_prediction
from bluba_api.store import SqlAlchemyStore
from bluba_predictor import PredictionEngineInput, predict


def test_adapter_maps_prediction_engine_output_to_risk_prediction() -> None:
    output = predict(PredictionEngineInput(child_id="child-1", prediction_at="2026-08-26T10:00:00+00:00"))

    prediction = to_risk_prediction(output)

    assert prediction["prediction_id"] == output["prediction_id"]
    assert prediction["child_id"] == "child-1"
    assert prediction["status"] == "INSUFFICIENT_DATA"
    assert prediction["risk"] is None
    assert prediction["confidence"]["level"] == "LOW"


def test_feature_builder_uses_history_before_cutoff_and_prediction_service_scores() -> None:
    store = SqlAlchemyStore("sqlite+pysqlite:///:memory:")
    store.create_schema()
    store.add_child("child-1", "Niño demo")
    prediction_at = datetime(2026, 8, 26, 12, tzinfo=UTC)

    for day in range(14):
        store.add_daily_record(
            "child-1",
            _record(prediction_at - timedelta(days=17 - day), "reparador", "tranquilo_alegre", "estable_con_apoyo"),
        )
    store.add_daily_record(
        "child-1",
        _record(prediction_at - timedelta(days=2), "interrumpido", "cansado_sueno", "estable_con_apoyo"),
    )
    store.add_daily_record(
        "child-1",
        _record(prediction_at - timedelta(days=1), "interrumpido", "irritable_llorando", "estable_con_apoyo"),
    )
    store.add_daily_record(
        "child-1",
        _record(
            prediction_at - timedelta(hours=1),
            "interrumpido",
            "irritable_llorando",
            "desregulacion_frecuente",
            routine_change=True,
            alert_level="alto",
        ),
    )
    store.add_daily_record(
        "child-1",
        _record(prediction_at + timedelta(hours=1), "reparador", "tranquilo_alegre", "excelente"),
    )

    engine_input = FeatureBuilder(store).build("child-1", prediction_at)
    prediction = PredictionService(store).evaluate_current("child-1", prediction_at=prediction_at)

    assert engine_input.features["sleep_quality"] == "interrumpido"
    assert engine_input.derived["sleep_altered_days_3d"] == 3
    assert engine_input.derived["sleep_baseline_deviation_14d"] == 1.0
    assert prediction["risk"] is not None
    assert prediction["top_factors"]


def _record(
    recorded_at: datetime,
    sleep_quality: str,
    wake_state: str,
    regulation_level: str,
    *,
    routine_change: bool = False,
    alert_level: str = "optimo",
) -> dict[str, object]:
    return {
        "recorded_at": recorded_at.isoformat(),
        "source": "FAMILY",
        "context": "HOME",
        "features": {
            "sleep_quality": sleep_quality,
            "sleep_hours": 8.0,
            "wake_state": wake_state,
            "regulation_level": regulation_level,
            "alert_level": alert_level,
            "routine_change": routine_change,
            "gastrointestinal_status": "normal",
            "observed_behavior": ["ruido_intenso"],
            "exceptional_event": False,
            "sensory_profile": ["hipersensibilidad_auditiva"],
        },
        "synthetic": True,
    }
