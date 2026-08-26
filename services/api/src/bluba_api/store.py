from __future__ import annotations

from collections import defaultdict
from datetime import UTC, datetime
from os import environ
from typing import Any
from uuid import uuid4

from sqlalchemy import DateTime, String, create_engine, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.types import JSON


def default_database_url() -> str:
    return environ.get("DATABASE_URL", "postgresql+psycopg://bluba:bluba@localhost:5432/bluba_anticipa")


class Base(DeclarativeBase):
    pass


def _json_column_type(url: str) -> JSON:
    if url.startswith("postgresql"):
        return JSONB
    return JSON


class DailyRecordModel(Base):
    __tablename__ = "daily_records"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    child_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    recorded_at: Mapped[str] = mapped_column(String(64), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(_json_column_type(default_database_url()), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class PredictionModel(Base):
    __tablename__ = "risk_predictions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    child_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    prediction_at: Mapped[str] = mapped_column(String(64), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(_json_column_type(default_database_url()), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class EventModel(Base):
    __tablename__ = "dysregulation_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    child_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    occurred_at: Mapped[str] = mapped_column(String(64), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(_json_column_type(default_database_url()), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class SqlAlchemyStore:
    def __init__(self, database_url: str | None = None) -> None:
        self.database_url = database_url or default_database_url()
        connect_args: dict[str, Any] = {}
        engine_kwargs: dict[str, Any] = {}
        if self.database_url == "sqlite+pysqlite:///:memory:":
            connect_args = {"check_same_thread": False}
            engine_kwargs["poolclass"] = StaticPool
        self.engine: Engine = create_engine(self.database_url, connect_args=connect_args, **engine_kwargs)
        self.session_factory = sessionmaker(self.engine, expire_on_commit=False)

    def create_schema(self) -> None:
        Base.metadata.create_all(self.engine)

    def add_daily_record(self, child_id: str, record: dict[str, Any]) -> dict[str, Any]:
        record_id = f"daily-record-{uuid4()}"
        response = {
            "record_id": record_id,
            "child_id": child_id,
            "recorded_at": record["recorded_at"],
            "source": record["source"],
            "persistence_status": "PERSISTED",
            "risk_recalculation_requested": True,
            "risk_recalculation_request_id": f"prediction-request-{uuid4()}",
        }
        with self.session_factory() as session:
            session.add(
                DailyRecordModel(
                    id=record_id,
                    child_id=child_id,
                    recorded_at=record["recorded_at"],
                    payload={"request": record, "response": response},
                    created_at=datetime.now(UTC),
                )
            )
            session.commit()
        return response

    def latest_features(self, child_id: str) -> dict[str, Any]:
        with self.session_factory() as session:
            model = session.scalars(
                select(DailyRecordModel)
                .where(DailyRecordModel.child_id == child_id)
                .order_by(DailyRecordModel.created_at.desc())
                .limit(1)
            ).first()
            if model is None:
                return {}
            request = model.payload["request"]
            return dict(request.get("features") or {})

    def add_event(self, child_id: str, event: dict[str, Any]) -> dict[str, Any]:
        event_id = f"event-{uuid4()}"
        payload = {**event, "event_id": event.get("event_id", event_id), "child_id": child_id}
        with self.session_factory() as session:
            session.add(
                EventModel(
                    id=payload["event_id"],
                    child_id=child_id,
                    occurred_at=payload.get("occurred_at", datetime.now(UTC).isoformat()),
                    payload=payload,
                    created_at=datetime.now(UTC),
                )
            )
            session.commit()
        return payload

    def set_latest_prediction(self, child_id: str, prediction: dict[str, Any]) -> None:
        with self.session_factory() as session:
            session.add(
                PredictionModel(
                    id=prediction["prediction_id"],
                    child_id=child_id,
                    prediction_at=prediction["prediction_at"],
                    payload=prediction,
                    created_at=datetime.now(UTC),
                )
            )
            session.commit()

    def get_latest_prediction(self, child_id: str) -> dict[str, Any] | None:
        with self.session_factory() as session:
            model = session.scalars(
                select(PredictionModel)
                .where(PredictionModel.child_id == child_id)
                .order_by(PredictionModel.created_at.desc())
                .limit(1)
            ).first()
            return None if model is None else dict(model.payload)


class InMemoryStore:
    def __init__(self) -> None:
        self._daily_records: dict[str, list[dict[str, Any]]] = defaultdict(list)
        self._events: dict[str, list[dict[str, Any]]] = defaultdict(list)
        self._latest_predictions: dict[str, dict[str, Any]] = {}

    def add_daily_record(self, record: dict[str, Any]) -> None:
        key = record.get("subject_id") or record.get("child_id")
        self._daily_records[key].append(record)

    def latest_observations(self, subject_id: str) -> list[dict[str, Any]]:
        if not self._daily_records[subject_id]:
            return []
        return list(self._daily_records[subject_id][-1].get("observations", []))

    def add_event(self, event: dict[str, Any]) -> None:
        self._events[event["subject_id"]].append(event)

    def set_latest_prediction(self, subject_id: str, prediction: dict[str, Any]) -> None:
        self._latest_predictions[subject_id] = prediction

    def get_latest_prediction(self, subject_id: str) -> dict[str, Any] | None:
        return self._latest_predictions.get(subject_id)
