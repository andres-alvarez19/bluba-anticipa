from bluba_api import InMemoryStore


def test_store_preserves_unknown_observation_value() -> None:
    store = InMemoryStore()
    record = {
        "subject_id": "subject-1",
        "observations": [
            {"feature_key": "sleep_quality", "status": "unknown", "value": None}
        ],
    }

    store.add_daily_record(record)

    assert store.latest_observations("subject-1")[0]["status"] == "unknown"
    assert store.latest_observations("subject-1")[0]["value"] is None
