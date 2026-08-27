from __future__ import annotations

from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect

from bluba_api.store import SqlAlchemyStore


ROOT = Path(__file__).resolve().parents[1]
LEGACY_INITIAL_TABLES = {"daily_records", "risk_predictions", "dysregulation_events"}
INITIAL_REVISION = "20260826_0001"


def main() -> None:
    store = SqlAlchemyStore()
    tables = set(inspect(store.engine).get_table_names())
    config = _alembic_config()

    if "alembic_version" not in tables:
        legacy_tables = tables & LEGACY_INITIAL_TABLES
        if legacy_tables == LEGACY_INITIAL_TABLES:
            command.stamp(config, INITIAL_REVISION)
            print("Demo DB: bootstrap previo reconocido en revisión 20260826_0001.")
        elif legacy_tables:
            names = ", ".join(sorted(legacy_tables))
            raise SystemExit(f"Demo DB insegura: bootstrap parcial sin Alembic ({names}).")

    command.upgrade(config, "head")
    print("Demo DB: migraciones al día.")


def _alembic_config() -> Config:
    config_path = ROOT / "services" / "api" / "alembic.ini"
    config = Config(str(config_path))
    config.set_main_option("script_location", str(ROOT / "services" / "api" / "migrations"))
    return config


if __name__ == "__main__":
    main()

