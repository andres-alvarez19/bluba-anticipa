def main() -> None:
    try:
        import uvicorn
    except ModuleNotFoundError as exc:
        raise SystemExit("Install API dependencies with 'make setup' before running the API.") from exc

    uvicorn.run("bluba_api.app:create_app", factory=True, host="0.0.0.0", port=8080)


if __name__ == "__main__":
    main()
