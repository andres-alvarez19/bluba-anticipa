from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy.exc import SQLAlchemyError

from bluba_api.store import SqlAlchemyStore


CHILD_ID = "child-demo-1"


def main() -> None:
    seed_demo(SqlAlchemyStore())


def seed_demo(store: SqlAlchemyStore, today: datetime | None = None) -> None:
    try:
        store.ensure_demo_child()
        store.delete_daily_records(CHILD_ID)
    except SQLAlchemyError as exc:
        raise SystemExit(
            "Seed demo requiere schema migrado. Ejecuta: make db-up && make db-migrate && make seed-demo."
        ) from exc

    today = (today or datetime.now(UTC)).replace(hour=8, minute=0, second=0, microsecond=0)
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
    regulation = {
        14: "estable_con_apoyo",
        15: "estable_con_apoyo",
        16: "desregulacion_frecuente",
    }[offset]
    return {
        "sleep_quality": "interrumpido",
        "sleep_hours": 5.5,
        "wake_state": "irritable_llorando" if offset >= 15 else "cansado_sueno",
        "regulation_level": regulation,
        "alert_level": "alto",
        "routine_change": offset == 16,
        "gastrointestinal_status": "normal",
        "observed_behavior": ["sobrecarga_sensorial", "ruido_intenso"],
        "exceptional_event": False,
        "sensory_profile_snapshot": ["hipersensibilidad_auditiva"],
    }


if __name__ == "__main__":
    main()
