# Arquitectura del sistema

## Vista Stage C

```text
Mobile
  ↓
packages/api-client
  ↓
FastAPI
  ↓
PostgreSQL
  ↓
FeatureBuilder
  ↓
PredictionEngineInput
  ↓
baseline-demo-v1
  ↓
PredictionEngineOutput
  ↓
PredictionService adapter
  ↓
RiskPrediction
  ↓
Mobile
```

## Responsabilidades

### Mobile

- Presentación mobile-first.
- UX diferenciada por rol cuando el slice lo requiera.
- Consumo de `packages/api-client`.
- Estados loading/error/empty/insufficient/low-confidence.
- Traducción visual de enums recibidos.
- Sin cálculo de riesgo.
- Sin cálculo de confianza.
- Sin thresholds.

### Backend

- API FastAPI.
- Persistencia PostgreSQL mediante SQLAlchemy/Alembic.
- Consultas temporales con corte `prediction_at`.
- FeatureBuilder.
- Orquestación del predictor.
- Adaptación `PredictionEngineOutput` -> `RiskPrediction`.
- Validación de contratos y control de acceso cuando se implemente autorización real.

### Predictor

- Recibe únicamente `PredictionEngineInput`.
- Produce `PredictionEngineOutput`.
- Implementa `baseline-demo-v1`.
- Mantiene scoring, confianza y explicabilidad del baseline.
- No conoce HTTP.
- No usa SQLAlchemy.
- No resuelve recomendaciones.
- No usa LLM.

### Contracts

- `contracts/` es la fuente de verdad de fronteras.
- `contracts/features.yaml` es la fuente de verdad semántica de features.
- `services/predictor/models/baseline-v1.yaml` contiene parámetros de ingeniería demostrativos; no es contrato ni fuente clínica.

## Model Status: baseline-demo-v1

`baseline-demo-v1` es determinista, explicable y ponderado. No tiene entrenamiento, calibración ni validación clínica. El risk score es un índice operacional demostrativo, no una probabilidad calibrada.

Los escenarios sintéticos de `evals/model/current-risk/` validan comportamiento del prototipo: estados, bandas, factores, temporalidad, missing data y no leakage. No miden accuracy clínica.

## Missing Data

- Missing no equivale a normal.
- `INSUFFICIENT_DATA` implica `risk = null`.
- `LOW_CONFIDENCE` mantiene `risk` visible y reporta confianza baja.
- Riesgo y confianza son dimensiones independientes.
- La disponibilidad de baseline se evalúa por historial válido; Stage C usa mínimo provisional de 7 días y baseline suficiente desde 14 días.

## Baseline

- Se calcula por niño.
- Excluye datos futuros.
- Separa la ventana reciente de 72h.
- Usa últimos días históricos válidos anteriores a la ventana reciente.
- Las fórmulas y semántica de features siguen gobernadas por `contracts/features.yaml`.

## Synthetic Data

`scripts/seed_demo.py` usa datos sintéticos para demo. La metadata sintética es interna a persistencia y no altera el contrato HTTP de DailyRecord. Las predicciones pueden exponer `data_quality.contains_synthetic_data` para que mobile muestre un indicador discreto.

## Restricciones

- No hay microservicios adicionales en el MVP sin ADR.
- El predictor puede ejecutarse dentro del proceso/backend como paquete, pero mantiene un límite lógico separable.
- No existe lógica predictiva en el dispositivo.
- No se ocultan datos faltantes con defaults semánticos.
