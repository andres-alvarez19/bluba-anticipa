from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy.exc import SQLAlchemyError

from bluba_api.store import SqlAlchemyStore


CHILD_ID = "child-demo-1"


def main() -> None:
    seed_demo(SqlAlchemyStore())


def seed_demo(store: SqlAlchemyStore, today: datetime | None = None) -> None:
    """Restore the deterministic video scenario and remove prior demo state.

    The recent family history intentionally has altered sleep but stable regulation.
    This yields a usable MEDIUM prediction. A later adverse SCHOOL observation adds
    independently observed regulation/context evidence and moves the unchanged
    baseline-demo-v1 predictor to HIGH.
    """
    try:
        store.ensure_demo_child()
        store.delete_daily_records(CHILD_ID)
        store.delete_predictions(CHILD_ID)
        store.delete_dysregulation_events(CHILD_ID)
        store.delete_observation_drafts(CHILD_ID)
    except SQLAlchemyError as exc:
        raise SystemExit(
            "Seed demo requiere schema migrado. Ejecuta: make db-up && make db-migrate && make demo-reset."
        ) from exc

    now = today or datetime.now(UTC)
    today = now.replace(hour=8, minute=0, second=0, microsecond=0)
    if today > now:
        today -= timedelta(days=1)
    start = today - timedelta(days=16)
    for offset in range(17):
        recorded_at = start + timedelta(days=offset)
        recent = offset >= 14
        features = _recent_features(offset) if recent else _baseline_features()
        store.add_daily_record(
            CHILD_ID,
            {
                "recorded_at": recorded_at.isoformat(),
                "source": "FAMILY",
                "context": "HOME",
                "features": features,
                "notes": "Datos sinteticos reproducibles para demo Stage C.",
            },
            synthetic=True,
        )

    print(f"Seed demo listo: {CHILD_ID} con 17 DailyRecords sinteticos.")


def _baseline_features() -> dict[str, object]:
    return {
        "sleep_quality": "reparador",
        "sleep_hours": 8.0,
        "wake_state": "tranquilo_alegre",
        "regulation_level": "estable_con_apoyo",
        "alert_level": "optimo",
        "routine_change": False,
        "gastrointestinal_status": "normal",
        "observed_behavior": ["juego_funcional"],
        "exceptional_event": False,
        "sensory_profile_snapshot": ["hipersensibilidad_auditiva"],
    }


def _recent_features(offset: int) -> dict[str, object]:
    return {
        "sleep_quality": "interrumpido",
        "sleep_hours": 5.5,
        "wake_state": "irritable_llorando" if offset >= 15 else "cansado_sueno",
        "regulation_level": "estable_con_apoyo",
        "alert_level": "optimo",
        "routine_change": False,
        "gastrointestinal_status": "normal",
        "observed_behavior": ["juego_funcional"],
        "exceptional_event": False,
        "sensory_profile_snapshot": ["hipersensibilidad_auditiva"],
    }


if __name__ == "__main__":
    main()
