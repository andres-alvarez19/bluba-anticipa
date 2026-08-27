# Contexto de arquitectura

## Etapas

- Stage A: foundation de monorepo, contratos, ADRs, roles y workflows.
- Stage B: walking skeleton mobile/API/predictor con PostgreSQL, OpenAPI generated types y vertical slice técnico.
- Stage C: current risk vertical slice con FeatureBuilder, baseline determinista, evals y demo mobile `Estado de hoy`.

## Path vigente Stage C

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

## Fuentes de verdad

- `contracts/openapi.yaml`: contrato externo Mobile ↔ Backend y transporte HTTP interno opcional.
- `contracts/prediction.schema.json`: contrato canónico Backend ↔ Predictor.
- `contracts/daily-record.schema.json`, `event.schema.json`, `recommendation.schema.json`: contratos de dominio especializados.
- `contracts/features.yaml`: semántica versionada de features, ventanas, missing data y baseline.
- `services/predictor/models/baseline-v1.yaml`: parámetros demo del baseline; no es contrato ni evidencia clínica.

## Principios

- Mobile consume `/v1/**` mediante `packages/api-client`.
- Mobile presenta DTOs del Backend y no calcula riesgo, confianza ni thresholds.
- API persiste, consulta temporalmente, construye features y orquesta el predictor.
- Predictor recibe solo `PredictionEngineInput` y produce `PredictionEngineOutput`.
- `RiskPrediction` público y `PredictionEngineOutput` interno son fronteras distintas.
- Riesgo y confianza son independientes.
- Datos faltantes permanecen explícitos; missing no equivale a normal.
- Metadata QA (`scenario_id`, `scenario_type`) no llega al predictor.
- Fixtures/evals sintéticos prueban comportamiento, no accuracy clínica.

## Gates

- `make contracts`
- `make generate-check`
- `make typecheck`
- `make test`
- `make eval`
- `make lint`

CI ejecuta además `make smoke-current-risk` contra PostgreSQL migrado.
