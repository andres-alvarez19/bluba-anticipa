# Contract Map — Bluba Anticipa MVP

Este documento orienta implementaciones; no reemplaza `contracts/`. Si existe conflicto, prevalecen los archivos de `contracts/`.

## 1. Frontera Mobile ↔ Backend

Fuente de verdad: `contracts/openapi.yaml` (`0.1.0-mvp`).

Características relevantes:

- rutas externas versionadas bajo `/v1/**`;
- autenticación bearer global, salvo sesión demo;
- identificador canónico del niño: `childId` en path y `child_id` en payloads;
- DTO público de riesgo: `RiskPrediction`;
- horizonte P0: 24 horas;
- niveles/thresholds no se recalculan en mobile;
- escrituras móviles pueden usar `Idempotency-Key`.

### Flujo mínimo Stage B

1. `POST /v1/auth/session` — sesión demo.
2. `GET /v1/children` — obtener un niño autorizado para demo.
3. `POST /v1/children/{childId}/daily-records` — persistir un registro confirmado.
4. Backend arma `PredictionEngineInput` e invoca predictor in-process.
5. `GET /v1/children/{childId}/risk-predictions/current` — recuperar el estado resultante.
6. Mobile presenta `OK`, `LOW_CONFIDENCE` o `INSUFFICIENT_DATA` sin recalcular niveles.

No es requisito de Stage B implementar todos los endpoints de OpenAPI; sí es obligatorio que los endpoints implementados respeten exactamente su contrato.

## 2. Frontera Backend ↔ Predictor

Fuente de verdad: `contracts/prediction.schema.json`.

La interfaz lógica es:

```text
PredictionEngineInput -> predict(...) -> PredictionEngineOutput
```

Invariantes:

- `prediction_at` define el corte temporal;
- no entra información posterior al corte;
- `horizon_hours = 24`;
- riesgo y confianza son independientes;
- datos faltantes permanecen explícitos;
- metadata de QA (`scenario_id`, `scenario_type`) no llega al motor;
- recomendaciones no pertenecen al output del predictor.

`/internal/v1/predictions:evaluate` en OpenAPI representa un transporte HTTP opcional. Stage B puede usar llamada in-process y no debe crear un microservicio únicamente para satisfacer esa ruta.

## 3. Daily records

Fuentes:

- `contracts/openapi.yaml` — `DailyRecordCreateRequest` y `DailyRecordResponse` para API pública.
- `contracts/daily-record.schema.json` — contrato de dominio/captura detallado.

Regla: no reutilizar el DTO antiguo basado en `subject_id + observations[]`. La versión vigente trabaja con `child_id` por contexto de recurso y `features` canónicas.

## 4. Predicción pública vs predicción interna

No son el mismo objeto.

### Predictor

```text
PredictionEngineOutput
```

Contiene output técnico/versionado del motor.

### Mobile

```text
RiskPrediction
```

Es el DTO público adaptado por Backend para consumo del cliente.

Backend realiza la traducción de forma explícita y testeada. Mobile nunca consume el contrato interno directamente.

## 5. Recomendaciones

Fuentes:

- `contracts/recommendation.schema.json`.
- componentes `Recommendation` / `RecommendationsResponse` de OpenAPI.

El predictor no inventa ni selecciona libremente intervenciones clínicas. Backend resuelve recomendaciones desde fuentes controladas y puede vincularlas con la predicción vigente.

## 6. Events / feedback / interventions

- Desregulaciones: `contracts/event.schema.json` + `/v1/children/{childId}/dysregulation-events`.
- Feedback de predicción: `/v1/risk-predictions/{predictionId}/feedback`.
- Intervenciones/resultados: endpoints `/v1/children/{childId}/interventions` y `/v1/interventions/{interventionId}/result`.

Estos contratos habilitan vertical slices posteriores; no bloquean el skeleton Stage B.

## 7. Tipos y code generation

- `contracts/openapi.yaml` genera tipos del cliente mediante `openapi-typescript`.
- Los wrappers de `packages/api-client` usan los tipos generados.
- `packages/shared-types` no debe contener copias manuales divergentes de DTOs HTTP.
- CI debe regenerar/verificar tipos y fallar si hay drift.

## 8. Contract validation

`make contracts` debe validar semánticamente:

- cada JSON Schema con Draft 2020-12 sin asumir que el root tiene `type: object` (puede usar `oneOf`/`$defs`);
- el documento OpenAPI 3.1 completo;
- resolución de referencias;
- sincronización de tipos generados.

Una validación que solo comprueba que el YAML/JSON parsea no es suficiente para declarar compatibilidad contractual.
