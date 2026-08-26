# Arquitectura del sistema

## Vista general

```text
┌──────────────────────────────┐
│ Mobile — React Native / Expo │
└──────────────┬───────────────┘
               │ HTTPS/JSON
               v
┌──────────────────────────────┐
│ API — FastAPI                │
│ auth/domain/orchestration    │
└──────────┬───────────┬───────┘
           │           │
           v           v
    PostgreSQL    Predictor Python
                       │
                       v
             Risk + Confidence
             + Explanation
             + Data Quality
```

## Responsabilidades

### Mobile
- Captura y confirmación de registros.
- Navegación/experiencia por rol.
- Presentación de riesgo, confianza, factores y recomendaciones.
- Caché/estado de UI.
- Integraciones móviles como audio y push.

### API
- Validación de requests/responses.
- Autorización y reglas de acceso cuando se implementen.
- Persistencia y recuperación longitudinal.
- Orquestación de feature assembly e inferencia.
- Exposición de contratos HTTP.

### Predictor
- Preprocesamiento predictivo.
- Construcción/consumo de features derivadas del dominio predictivo.
- Baseline individual y ventanas temporales.
- Scoring de riesgo.
- Estimación de confianza/calidad cuando corresponda al motor.
- Explicabilidad.

### Contracts
- API y estructuras de dominio compartidas.
- Registro de features.
- Criterio objetivo para contract tests.

## Restricciones

- No hay microservicios adicionales en el MVP sin ADR.
- El predictor puede ejecutarse inicialmente dentro del proceso/backend como paquete, pero mantiene un límite lógico separable.
- No existe lógica predictiva en el dispositivo.
- No se ocultan datos faltantes con defaults semánticos.
