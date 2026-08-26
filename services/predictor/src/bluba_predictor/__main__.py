from .engine import PredictionEngineInput, predict


def main() -> None:
    prediction = predict(PredictionEngineInput(child_id="demo-child"))
    print(prediction["status"])


if __name__ == "__main__":
    main()
