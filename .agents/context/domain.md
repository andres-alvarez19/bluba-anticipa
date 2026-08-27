# Contexto de dominio

## Términos canónicos

### Child
Identificador anonimizado del niño cuyo historial longitudinal analiza el sistema. En los contratos vigentes se usa `child_id`/`childId`; no introducir alias heredados.

### Daily record
Registro cotidiano confirmado proveniente de familia, educación o profesionales. Los valores faltantes se conservan explícitamente como `null`/`desconocido` cuando corresponda. Un DailyRecord no contiene scores ni features derivadas longitudinales.

### Observation draft
Borrador generado desde texto o audio antes de persistir un registro longitudinal. Debe confirmarse humanamente antes de convertirse en DailyRecord.

### Dysregulation event
Evento histórico de escalada/desregulación. Es fuente operacional para targets/evaluación futura, no una inferencia desde `regulation_level`.

### Baseline individual
Referencia longitudinal por niño. Stage C separa la ventana reciente de 72h, usa últimos días históricos válidos y considera baseline provisional desde 7 días válidos y suficiente desde 14. Las fórmulas se rigen por `contracts/features.yaml`.

### Risk
Índice operacional demostrativo para riesgo preventivo en las próximas 24 horas. No es probabilidad clínica calibrada.

### Confidence
Medida independiente de la solidez de la evidencia disponible. Puede variar sin cambiar el risk input.

### Data quality
Evidencia observable sobre completitud, frescura, fuentes, historial y faltantes. Missing no equivale a normal.

### Risk factor
Feature directa o derivada usada para explicar el resultado. Debe ser trazable y no presentarse como causalidad clínica.

### Prediction engine input/output
Contrato interno Backend ↔ Predictor definido en `contracts/prediction.schema.json`. El motor recibe únicamente información disponible hasta `prediction_at`.

### Risk prediction
DTO externo consumido por mobile (`RiskPrediction`). Backend adapta desde `PredictionEngineOutput`.

### Recommendation
Estrategia preventiva resuelta por Backend desde fuentes controladas. No pertenece al predictor Stage C.

## Invariantes

- Horizonte P0: 24 horas.
- `prediction_at` es el corte temporal.
- Riesgo y confianza son independientes.
- `INSUFFICIENT_DATA` implica `risk = null`.
- `LOW_CONFIDENCE` mantiene risk visible.
- Mobile no recalcula thresholds ni niveles.
- Synthetic demo/eval data debe quedar marcada como tal y no se usa para claims clínicos.

## Features

`contracts/features.yaml` es la fuente de verdad del catálogo de features y reglas semánticas. No duplicar sus fórmulas completas en docs auxiliares.
