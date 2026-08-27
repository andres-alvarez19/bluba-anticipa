from __future__ import annotations

from datetime import UTC, datetime
from os import environ
from typing import Any
from uuid import uuid4

from sqlalchemy import DateTime, String, create_engine, delete, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.types import JSON


def default_database_url() -> str:
    return environ.get("DATABASE_URL", "postgresql+psycopg://bluba:bluba@localhost:5432/bluba_anticipa")


class Base(DeclarativeBase):
    pass


def _json_column_type() -> JSON:
    return JSON().with_variant(JSONB, "postgresql")


def parse_domain_datetime(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


class ChildModel(Base):
    __tablename__ = "children"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(160), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class DailyRecordModel(Base):
    __tablename__ = "daily_records"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    child_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    recorded_at: Mapped[str] = mapped_column(String(64), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(_json_column_type(), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class PredictionModel(Base):
    __tablename__ = "risk_predictions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    child_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    prediction_at: Mapped[str] = mapped_column(String(64), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(_json_column_type(), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class EventModel(Base):
    __tablename__ = "dysregulation_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    child_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    occurred_at: Mapped[str] = mapped_column(String(64), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(_json_column_type(), nullable=False)
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

    def add_child(self, child_id: str, display_name: str) -> dict[str, Any]:
        with self.session_factory() as session:
            model = ChildModel(id=child_id, display_name=display_name, created_at=datetime.now(UTC))
            session.merge(model)
            session.commit()
        return {"id": child_id, "display_name": display_name, "relationship_contexts": ["HOME"]}

    def ensure_demo_child(self) -> dict[str, Any]:
        return self.add_child("child-demo-1", "Mateo R.")

    def list_children(self) -> list[dict[str, Any]]:
        with self.session_factory() as session:
            children = session.scalars(select(ChildModel).order_by(ChildModel.created_at.asc())).all()
            return [
                {"id": child.id, "display_name": child.display_name, "relationship_contexts": ["HOME"]}
                for child in children
            ]

    def add_daily_record(self, child_id: str, record: dict[str, Any], *, synthetic: bool = False) -> dict[str, Any]:
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
                    payload={
                        "request": record,
                        "response": response,
                        "metadata": {"synthetic": synthetic},
                    },
                    created_at=datetime.now(UTC),
                )
            )
            session.commit()
        return response

    def delete_daily_records(self, child_id: str) -> None:
        with self.session_factory() as session:
            session.execute(delete(DailyRecordModel).where(DailyRecordModel.child_id == child_id))
            session.commit()

    def delete_predictions(self, child_id: str) -> None:
        with self.session_factory() as session:
            session.execute(delete(PredictionModel).where(PredictionModel.child_id == child_id))
            session.commit()

    def delete_dysregulation_events(self, child_id: str) -> None:
        with self.session_factory() as session:
            session.execute(delete(EventModel).where(EventModel.child_id == child_id))
            session.commit()

    def latest_features(self, child_id: str) -> dict[str, Any]:
        model = self.latest_daily_record_before(child_id, datetime.now(UTC))
        if model is None:
            return {}
        return dict(model.get("features") or {})

    def list_daily_records(
        self,
        child_id: str,
        from_at: datetime | None = None,
        to_at: datetime | None = None,
    ) -> list[dict[str, Any]]:
        with self.session_factory() as session:
            models = session.scalars(
                select(DailyRecordModel)
                .where(DailyRecordModel.child_id == child_id)
                .order_by(DailyRecordModel.recorded_at.asc())
            ).all()
        records = [_daily_record_from_model(model) for model in models]
        return _filter_by_interval(records, "recorded_at", from_at=from_at, to_at=to_at)

    def latest_daily_record_before(self, child_id: str, prediction_at: datetime) -> dict[str, Any] | None:
        records = self.list_daily_records(child_id, to_at=prediction_at)
        return records[-1] if records else None

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

    def list_dysregulation_events(
        self,
        child_id: str,
        from_at: datetime | None = None,
        to_at: datetime | None = None,
    ) -> list[dict[str, Any]]:
        with self.session_factory() as session:
            models = session.scalars(
                select(EventModel).where(EventModel.child_id == child_id).order_by(EventModel.occurred_at.asc())
            ).all()
        events = [dict(model.payload) for model in models]
        return _filter_by_interval(events, "occurred_at", from_at=from_at, to_at=to_at)

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


def _daily_record_from_model(model: DailyRecordModel) -> dict[str, Any]:
    payload = dict(model.payload)
    record = dict(payload["request"])
    metadata = dict(payload.get("metadata") or {})
    record["_metadata"] = metadata
    return record


def _filter_by_interval(
    items: list[dict[str, Any]],
    timestamp_key: str,
    *,
    from_at: datetime | None,
    to_at: datetime | None,
) -> list[dict[str, Any]]:
    from_utc = _as_utc(from_at) if from_at is not None else None
    to_utc = _as_utc(to_at) if to_at is not None else None
    eligible = []
    for item in items:
        timestamp = _as_utc(parse_domain_datetime(item[timestamp_key]))
        if (from_utc is None or timestamp > from_utc) and (to_utc is None or timestamp <= to_utc):
            eligible.append(item)
    return sorted(eligible, key=lambda item: _as_utc(parse_domain_datetime(item[timestamp_key])))
