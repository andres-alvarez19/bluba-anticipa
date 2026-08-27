# Bluba Anticipa

Bluba Anticipa es un sistema mobile-first de apoyo preventivo que analiza longitudinalmente registros cotidianos para identificar señales tempranas de riesgo de desregulación, estimar confianza independiente y explicar factores relevantes.

Stage C implementa el slice demo `Estado de hoy`: mobile consulta el riesgo actual desde Backend, Backend construye features longitudinales y el predictor `baseline-demo-v1` entrega riesgo, confianza y factores. El score es un índice operacional demostrativo, no una probabilidad clínica calibrada.

## Architecture

```text
Mobile
  -> packages/api-client
  -> FastAPI
  -> PostgreSQL
  -> FeatureBuilder
  -> PredictionEngineInput
  -> baseline-demo-v1
  -> PredictionEngineOutput
  -> PredictionService adapter
  -> RiskPrediction
  -> Mobile
```

Más detalle:

- `docs/architecture/system.md`
- `docs/architecture/data-flow.md`
- `docs/architecture/contract-map.md`
- `docs/architecture/decisions/`

## Contracts

`contracts/` es la fuente de verdad para fronteras. `contracts/features.yaml` es la fuente de verdad semántica para features, ventanas, missing data y baseline.

Validar contratos:

```bash
make contracts
```

Verificar tipos generados desde OpenAPI:

```bash
make generate-check
```

## Run Locally

Fresh environment:

```bash
make setup
make db-up
make db-migrate
make seed-demo
```

Terminal 1:

```bash
make api
```

Terminal 2:

```bash
EXPO_PUBLIC_API_URL=<url> make mobile
```

URLs habituales:

- iOS simulator: `http://localhost:8080`
- Android emulator: `http://10.0.2.2:8080`
- Physical device: `http://<LAN_IP>:8080`

Runbook completo: `docs/development/demo-runbook.md`.

## Tests And Evals

```bash
make typecheck
make test
make eval
make lint
```

`make eval` ejecuta `evals/model/current-risk/`, una suite sintética de comportamiento para el current-risk Stage C. No mide accuracy clínica.

Readiness local de demo:

```bash
make demo-check
```

## Harness De Agentes

Leer `AGENTS.md` antes de modificar código. Roles: `.agents/roles/`. Workflows: `.agents/workflows/`. Contexto común: `.agents/context/`.

Resumen de etapas:

- Stage A: foundation de arquitectura, contratos, roles, workflows y ADRs.
- Stage B: walking skeleton integrado con PostgreSQL, FastAPI, generated OpenAPI types y mobile.
- Stage C: current risk vertical slice con FeatureBuilder, baseline demo, evals y demo UX.
