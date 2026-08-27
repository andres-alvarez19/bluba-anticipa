# ADR-012 — Baseline determinista para riesgo actual Stage C

- Status: Accepted
- Date: 2026-08-26

## Context

Stage C necesita demostrar el vertical slice de riesgo actual con historial longitudinal, datos faltantes, confianza y explicabilidad. No existen todavía datos reales suficientes para entrenar, calibrar o validar clínicamente un modelo.

## Decision

Usar `baseline-demo-v1`: un baseline determinista, explicable y ponderado para la demo de hackathon.

El flujo vigente es:

```text
DailyRecord history
  -> FeatureBuilder
  -> PredictionEngineInput
  -> baseline-demo-v1
  -> PredictionEngineOutput
  -> PredictionService adapter
  -> RiskPrediction
```

La decisión incluye:

- riesgo y confianza independientes;
- baseline individual por niño;
- separación de ventana reciente de 72h;
- datos futuros excluidos por `prediction_at`;
- manejo explícito de `INSUFFICIENT_DATA` con `risk = null`;
- `LOW_CONFIDENCE` conserva risk visible;
- parámetros y thresholds provisionales en `baseline-v1.yaml`;
- escenarios sintéticos para validación del prototipo;
- indicador de datos sintéticos cuando corresponda.

## Consequences

- El score de riesgo es un índice operacional demostrativo, no una probabilidad calibrada.
- No hay entrenamiento ni validación clínica en Stage C.
- No se deben afirmar sensibilidad, especificidad, precisión clínica ni causalidad.
- Cambios de weights o semántica del baseline deben pasar por tests/evals y documentarse.
- `contracts/features.yaml` sigue siendo la fuente semántica de features; `baseline-v1.yaml` solo contiene parámetros de ingeniería demo.

## Alternatives

- Entrenar un modelo supervisado ahora: rechazado por falta de datos suficientes y riesgo de claims clínicos no sustentados.
- Mantener un mock always-insufficient: rechazado porque no prueba el flujo longitudinal ni explicabilidad.
- Calcular riesgo en mobile: rechazado por violar el límite arquitectónico y duplicar thresholds.
