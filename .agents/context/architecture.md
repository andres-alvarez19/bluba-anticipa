# Contexto de arquitectura

## Componentes

```text
Mobile (React Native + Expo)
        |
   HTTPS / OpenAPI
        v
API (FastAPI)
   |             \
   |              -> Predictor (Python, in-process en MVP)
   v
PostgreSQL
```

## Fuentes de verdad de integración

- `contracts/openapi.yaml`: contrato externo Mobile ↔ Backend y transporte HTTP interno opcional.
- `contracts/prediction.schema.json`: contrato canónico Backend ↔ motor predictivo (`PredictionEngineInput` / `PredictionEngineOutput`).
- `contracts/daily-record.schema.json`, `event.schema.json`, `recommendation.schema.json`: contratos de dominio especializados.
- `contracts/features.yaml`: registro versionado de features y reglas derivadas.

Los contratos vigentes usan `child_id`/`childId`; no mantener DTOs paralelos con `subject_id`.

## Principios

- Monorepo con límites de ownership claros.
- Contract-first: `contracts/` precede a implementaciones y tipos manuales.
- Mobile consume endpoints `/v1/**`, presenta DTOs del Backend y no calcula riesgo/confianza.
- API aplica autenticación/autorización, persistencia, adaptación de DTOs y orquestación.
- Predictor expone una interfaz equivalente a `predict(PredictionEngineInput) -> PredictionEngineOutput` y no conoce UI ni contratos HTTP públicos.
- `RiskPrediction` público y `PredictionEngineOutput` interno son fronteras distintas; Backend realiza la adaptación explícita.
- Las recomendaciones se resuelven en Backend y no forman parte de la salida interna del predictor.
- El horizonte predictivo P0 es 24 horas y el corte temporal es `prediction_at`.
- Fixtures/mocks deben validar contra los contratos reales.

## Persistencia Stage B

Para el skeleton técnico se adopta PostgreSQL mediante SQLAlchemy 2.x y Alembic, con driver `psycopg` y una capa repository. El API no debe depender de un store global en memoria fuera de tests/fixtures.

## Tipos del cliente

Los tipos HTTP consumidos por mobile deben generarse/derivarse desde `contracts/openapi.yaml`. No mantener `Prediction`/`DailyRecord` escritos manualmente como segunda fuente de verdad. `packages/shared-types` queda reservado para tipos no cubiertos por OpenAPI o reexports generados.

## Layout objetivo

```text
apps/mobile/
services/api/
services/predictor/
packages/api-client/
packages/shared-types/
packages/shared-config/
contracts/
data/
evals/
tests/
docs/
.agents/
```

## Criterio de Stage B

El skeleton se considera integrado cuando existe al menos un flujo real:

```text
Mobile -> POST /v1/children/{childId}/daily-records
       -> FastAPI -> PostgreSQL
       -> Predictor mock/baseline mediante PredictionEngineInput/Output
       -> GET /v1/children/{childId}/risk-predictions/current
       -> Mobile
```

El resultado puede ser `INSUFFICIENT_DATA`; no es necesario implementar un modelo ML en esta etapa.
