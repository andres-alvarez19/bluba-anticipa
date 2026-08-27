from . import PredictionEngineInput, predict


def main() -> None:
    prediction = predict(
        PredictionEngineInput(
            child_id="demo-child",
            prediction_at="2026-08-26T10:00:00+00:00",
            horizon_hours=24,
            features={
                "sleep_quality": "reparador",
                "sleep_hours": 8.0,
                "wake_state": "tranquilo_alegre",
                "regulation_level": "estable_con_apoyo",
                "alert_level": "optimo",
                "routine_change": False,
                "gastrointestinal_status": "normal",
                "observed_behavior": [],
                "exceptional_event": False,
                "sensory_profile": [],
            },
            derived={
                "sleep_altered_days_3d": 0,
                "sleep_baseline_deviation_14d": 0.0,
                "wake_adverse_days_3d": 0,
                "low_regulation_days_3d": 0,
                "regulation_trend_3d": 0.0,
                "dysregulation_events_7d": 0,
                "days_since_last_dysregulation": None,
                "adverse_factor_count_current": 0,
                "relevant_trigger_exposure": False,
                "alert_outside_optimal": False,
            },
            data_quality={
                "completeness": 1.0,
                "critical_present": 3,
                "critical_total": 3,
                "hours_since_last_record": 2,
                "history_days": 14,
                "sources": ["FAMILY", "SCHOOL"],
                "missing_fields": [],
                "missing_critical_data": [],
                "contains_synthetic_data": True,
            },
        )
    )
    print(prediction["status"])


if __name__ == "__main__":
    main()
