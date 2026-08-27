# Demo Runbook

## Fresh Environment

From the repository root:

```bash
make setup
make db-up
make db-migrate
make seed-demo
```

## Run The Demo

Terminal 1:

```bash
make api
```

Terminal 2:

```bash
EXPO_PUBLIC_API_URL=<url> make mobile
```

Use the URL that matches the device:

- iOS simulator: `http://localhost:8080`
- Android emulator: `http://10.0.2.2:8080`
- Physical device: `http://<LAN_IP>:8080`

## Expected Result

After `make seed-demo`, the app should show `child-demo-1` as the selected demo child and the main action should be `Ver estado de hoy`.

The seeded Stage C scenario is synthetic. Expected current-risk behavior:

- `status`: `OK`
- `risk`: `MEDIUM` in the current seed scenario
- `confidence`: `HIGH`
- Synthetic indicator visible as `Datos de demostración`
- Top factors should be close to the current eval output, typically including sleep baseline deviation, altered sleep, and recent adverse context such as routine change or regulation trend.

Do not rely on an exact score in the demo script or presentation. Small baseline changes can legitimately move the numeric index while preserving the behavioral contract.

## Demo Check

For a local readiness pass that does not start Expo:

```bash
make demo-check
```

This runs contract validation, generated-client drift check, typecheck, tests, current-risk evals, and lint. The PostgreSQL smoke runs in CI after migrations with `DATABASE_URL` set by the workflow.

## Notes

The mobile screen is a Stage C read-only risk demo. It does not implement daily capture, voice input, recommendations, interventions, push notifications, professional views, educator views, or history charts.

The displayed risk and confidence levels come from Backend. Mobile may translate enum labels, but it must not calculate thresholds from scores.
