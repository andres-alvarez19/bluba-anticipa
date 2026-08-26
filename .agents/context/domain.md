# Contexto de dominio

## Términos canónicos

### Child
Identificador anonimizado del niño cuyo historial longitudinal analiza el sistema. En los contratos HTTP y predictivos vigentes se usa `child_id`/`childId`. No introducir `subject_id` como alias local salvo migración explícita aprobada.

### Daily record
Registro cotidiano confirmado proveniente de familia, educación o profesionales. El contrato externo vigente usa `DailyRecordCreateRequest`/`DailyRecordResponse`; los valores faltantes se conservan explícitamente en las features canónicas.

### Observation draft
Borrador generado desde texto o audio antes de persistir un registro longitudinal. Puede corregirse y debe confirmarse humanamente antes de convertirse en un `DailyRecord`.

### Dysregulation event
Evento histórico de escalada/desregulación utilizado como outcome/feedback y parte de la memoria longitudinal. No implica por sí mismo una clasificación clínica.

### Baseline individual
Representación dinámica del comportamiento habitual del mismo niño durante una ventana histórica válida. El contrato del MVP utiliza una referencia de 14 días para el snapshot público; su eficacia predictiva continúa siendo una hipótesis a validar.

### Risk
Índice operacional que expresa compatibilidad entre el patrón actual/reciente y patrones asociados a una desregulación dentro de las próximas 24 horas. No debe presentarse como probabilidad clínica calibrada.

### Confidence
Medida independiente de la solidez de la evidencia disponible para emitir la estimación. Puede considerar completitud, frescura, cobertura de fuentes e historial disponible.

### Data quality
Evidencia observable sobre completitud, antigüedad, cobertura y faltantes. Dato faltante no equivale a normalidad.

### Risk factor
Feature directa o derivada utilizada para explicar el resultado del motor. El contrato público la expresa mediante `TopFactor`; debe ser trazable y no presentarse como causalidad.

### Prediction engine input/output
Contrato interno Backend ↔ Predictor definido por `PredictionEngineInput` y `PredictionEngineOutput` en `contracts/prediction.schema.json` y reflejado en `contracts/openapi.yaml`. El motor recibe únicamente información disponible hasta `prediction_at`.

### Risk prediction
DTO externo consumido por mobile (`RiskPrediction`). No es idéntico al output interno del predictor: Backend adapta el resultado interno al contrato público y aplica reglas de presentación/orquestación autorizadas.

### Recommendation
Estrategia preventiva resuelta por Backend desde una fuente permitida: plan profesional aprobado, historial de éxito o catálogo validado. Las recomendaciones quedan fuera del contrato interno del predictor.

### Feedback
Confirmación posterior sobre si ocurrió una desregulación dentro de la ventana evaluada y, por separado, resultados de intervenciones aplicadas. Alimenta evaluación y aprendizaje futuro.

## Invariantes relevantes

- El horizonte P0 es de 24 horas.
- `prediction_at` es el corte temporal: el predictor no recibe información futura.
- Riesgo y confianza son independientes.
- `INSUFFICIENT_DATA` no debe convertirse en un score inventado.
- `scenario_id`/`scenario_type` son metadatos de QA y nunca llegan al predictor.
- El Frontend no recalcula thresholds ni niveles.

## Variables conceptuales

`contracts/features.yaml` es la fuente de verdad del registro de features directas y derivadas. El mapping hacia columnas de datasets reales debe documentarse en Data y nunca inferirse silenciosamente.
