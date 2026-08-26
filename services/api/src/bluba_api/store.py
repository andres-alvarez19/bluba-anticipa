from __future__ import annotations

from collections import defaultdict
from typing import Any


class InMemoryStore:
    def __init__(self) -> None:
        self._daily_records: dict[str, list[dict[str, Any]]] = defaultdict(list)
        self._events: dict[str, list[dict[str, Any]]] = defaultdict(list)
        self._latest_predictions: dict[str, dict[str, Any]] = {}

    def add_daily_record(self, record: dict[str, Any]) -> None:
        self._daily_records[record["subject_id"]].append(record)

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
