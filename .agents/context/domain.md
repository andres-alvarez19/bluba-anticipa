# Contexto de dominio

## Términos canónicos

### Subject
Identificador anonimizado del niño cuyo historial longitudinal analiza el sistema. En contratos se usa `subject_id`.

### Daily record
Registro cotidiano proveniente de familia, educación o profesionales. Puede contener variables observadas y valores desconocidos explícitos.

### Dysregulation event
Evento histórico de desregulación utilizado como outcome/feedback y como parte de la memoria longitudinal. No implica por sí mismo una clasificación clínica.

### Baseline individual
Representación dinámica del comportamiento habitual del mismo sujeto durante una ventana histórica válida. Su ventana exacta es una hipótesis a validar.

### Risk
Estimación de compatibilidad entre el patrón actual/reciente y patrones asociados a una desregulación futura dentro del horizonte definido. No equivale a certeza clínica.

### Confidence
Medida independiente que resume cuán sólida es la evidencia disponible para emitir la estimación. Puede considerar completitud, frescura, fuentes disponibles, historial y contradicciones.

### Data quality
Información observable sobre completitud/frescura/cobertura que alimenta la confianza. No debe ocultar datos faltantes mediante defaults.

### Risk factor
Feature directa o derivada que contribuye a explicar una predicción. Debe ser trazable a datos/transformaciones conocidas.

### Recommendation
Estrategia preventiva seleccionada desde una fuente permitida: plan profesional, historial de éxito o catálogo validado.

### Feedback
Confirmación posterior sobre si ocurrió un evento y qué estrategia se utilizó/qué resultado tuvo. Alimenta evaluación y aprendizaje futuro.

## Variables conceptuales disponibles

Las fuentes oficiales describen, entre otras: sueño, estado basal al despertar, apoyo requerido, salud gastrointestinal, alimentación, rutina, comportamiento, alerta, regulación/desregulación, participación, interacciones sociales, recreos, eventos excepcionales e historial de crisis.

`contracts/features.yaml` registra el vocabulario conceptual. El mapeo exacto a columnas del dataset real debe documentarse mediante DATA-01 y no debe inferirse silenciosamente.
