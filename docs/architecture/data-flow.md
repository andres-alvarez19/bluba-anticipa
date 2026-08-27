# Flujo de datos

## Current Risk Stage C

```text
GET /v1/children/{childId}/risk-predictions/current
  -> PredictionService
  -> PostgreSQL history/events up to prediction_at
  -> FeatureBuilder
  -> PredictionEngineInput
  -> baseline-demo-v1
  -> PredictionEngineOutput
  -> RiskPrediction
  -> Mobile Estado de hoy
```

El flujo actual consulta riesgo preventivo; no captura DailyRecords desde la pantalla principal de demo.

## FeatureBuilder

1. Recupera DailyRecords y DysregulationEvents conocidos hasta `prediction_at`.
2. Respeta intervalo `(from_at, to_at]` para ventanas temporales.
3. Ordena por instantes reales normalizados, no por texto ISO.
4. Construye features canónicas directas desde la última observación válida conocida.
5. Calcula derivadas recientes/baseline según `contracts/features.yaml`.
6. Produce `data_quality` con missing explícito, fuentes, frescura, historial válido y synthetic flag.

## Predictor

1. Recibe un `PredictionEngineInput` canónico.
2. Valida horizonte 24h.
3. Calcula risk y confidence como dimensiones independientes.
4. Si corresponde `INSUFFICIENT_DATA`, entrega `risk = null`.
5. Si corresponde `LOW_CONFIDENCE`, mantiene risk visible.
6. Entrega top factors en el orden calculado por el motor.

## Texto/Voz Futuro

```text
voz/texto
  -> transcripción/estructuración
  -> preview no persistido
  -> confirmación/edición humana
  -> DailyRecord
  -> API
```

El componente generativo termina antes del motor predictivo. Un LLM no es motor de riesgo.

## Feedback Futuro

```text
predicción -> ventana temporal -> feedback del usuario
                               -> evento ocurrido/no ocurrido
                               -> estrategia aplicada
                               -> outcome
```

El feedback puede alimentar evaluación, calibración y memoria de intervenciones en etapas posteriores. No implica aprendizaje clínico automático en Stage C.
