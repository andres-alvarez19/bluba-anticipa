from .engine import PredictionInput, predict


def main() -> None:
    prediction = predict(PredictionInput(subject_id="demo-subject"))
    print(prediction["status"])


if __name__ == "__main__":
    main()
