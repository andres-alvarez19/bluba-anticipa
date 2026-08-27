# Contract Map — Bluba Anticipa MVP

Este documento orienta implementaciones; no reemplaza `contracts/`. Si existe conflicto, prevalecen los archivos de `contracts/`.

## Mobile ↔ Backend

Fuente de verdad: `contracts/openapi.yaml`.

- Rutas públicas versionadas bajo `/v1/**`.
- Identificador canónico del niño: `childId` en path y `child_id` en payloads cuando aplica.
- DTO público de riesgo: `RiskPrediction`.
- Horizonte P0: 24 horas.
- Mobile consume `packages/api-client`; no hace `fetch` manual duplicado para endpoints ya cubiertos.
- Mobile presenta niveles recibidos; no recalcula riesgo, confianza ni thresholds.

Flujo Stage C actual:

```text
createDemoSession(FAMILY)
  -> listAuthorizedChildren()
  -> getCurrentRiskPrediction(childId)
  -> Estado de hoy
```

## Backend ↔ Predictor

Fuente de verdad: `contracts/prediction.schema.json`.

La frontera lógica es:

```text
PredictionEngineInput -> predict(...) -> PredictionEngineOutput
```

Invariantes:

- `prediction_at` define el corte temporal.
- No entra información posterior al corte.
- `horizon_hours = 24`.
- Riesgo y confianza son independientes.
- Datos faltantes permanecen explícitos.
- Metadata de QA (`scenario_id`, `scenario_type`) no llega al motor.
- Recomendaciones no pertenecen al output del predictor.

El transporte HTTP interno de OpenAPI es opcional para etapas futuras. Stage C usa llamada in-process manteniendo el límite lógico.

## Daily Records

Fuentes:

- `contracts/openapi.yaml` para `DailyRecordCreateRequest` y `DailyRecordResponse`.
- `contracts/daily-record.schema.json` para el contrato de dominio/captura.

Regla: no introducir campos QA/demo dentro del payload contractual. La metadata sintética se persiste internamente y solo alimenta `data_quality.contains_synthetic_data`.

## Feature Semantics

Fuente de verdad: `contracts/features.yaml`.

FeatureBuilder materializa un snapshot canónico para el predictor:

```text
DailyRecord history
  -> FeatureBuilder
  -> PredictionEngineInput
```

Los cálculos feature-specific usan días donde la variable necesaria está conocida. `null`/`desconocido` nunca cuenta como normal.

## Prediction Output vs Public RiskPrediction

No son el mismo objeto.

- Predictor produce `PredictionEngineOutput`.
- Backend adapta a `RiskPrediction`.
- Mobile consume `RiskPrediction`.

## Evals

`evals/model/current-risk/` contiene escenarios sintéticos de comportamiento para Stage C. Miden pass/fail del slice actual, no accuracy clínica.

`make eval` ejecuta la suite vigente.
