# ADR-007 — Límite lógico del predictor

- Status: Accepted
- Date: 2026-08-26
- Amended: 2026-08-26 para alineación con contratos v0.1.0 del MVP

## Context

El MVP necesita velocidad, pero la lógica predictiva debe ser testeable, versionable y reemplazable. Los contratos finalizados distinguen explícitamente el DTO público consumido por mobile (`RiskPrediction`) del contrato interno Backend ↔ Predictor.

## Decision

El predictor vive en `services/predictor` y expone una interfaz de dominio equivalente a:

```text
predict(PredictionEngineInput) -> PredictionEngineOutput
```

Las formas canónicas de entrada/salida se definen en `contracts/prediction.schema.json` y se reflejan opcionalmente como transporte HTTP interno en `contracts/openapi.yaml`.

Durante el MVP el predictor puede ejecutarse in-process dentro del backend. No es obligatorio desplegar un microservicio independiente.

Backend es responsable de adaptar `PredictionEngineOutput` al DTO público `RiskPrediction`, sin recalcular dentro de Mobile los thresholds, niveles ni explicaciones del motor.

## Consequences

- No se introduce un microservicio por defecto.
- Predictor no conoce rutas HTTP públicas, autenticación del usuario ni componentes mobile.
- API no replica scoring/feature logic del predictor.
- Mobile no consume directamente `PredictionEngineOutput`.
- Recomendaciones preventivas quedan fuera del predictor y son resueltas por Backend desde fuentes controladas.
- El corte temporal `prediction_at` debe respetarse: ninguna feature futura puede entrar al motor.
