# MVP — NeuroHack 2026

## Objetivo

Demostrar un flujo mobile funcional que transforme registros cotidianos en una estimación preventiva comprensible y trazable, sin presentar el prototipo como un modelo clínicamente validado.

## P0

- Aplicación móvil React Native + Expo.
- Perfil/selector de sujeto anonimizado para demo.
- Registro diario estructurado.
- Registro por texto y flujo de voz demostrable con confirmación humana.
- Riesgo para horizonte configurable con foco en 24 h.
- Confianza independiente del riesgo.
- Calidad de datos y advertencia de información insuficiente.
- Principales factores explicativos.
- Recomendaciones provenientes de fuentes permitidas.
- Historial breve y feedback posterior.
- Manejo explícito de valores desconocidos.

## P1

- Notificaciones push sin contenido sensible.
- Experiencia escolar diferenciada.
- Vista profesional con mayor profundidad.
- Visualizaciones longitudinales.

## Fuera del MVP

- Modelo clínicamente validado.
- Wearables/sensores fisiológicos.
- Escucha continua.
- GPS, reconocimiento facial, cámaras o EEG.
- Intervención automática.
- Arquitectura microservicios/Kubernetes/event streaming sin necesidad demostrada.

## Primer vertical slice

```text
Mobile -> POST daily record -> API -> predictor baseline/mock
       <- Prediction(risk, confidence, factors, data quality)
```

El slice se considera válido cuando puede ejecutarse de punta a punta usando contratos reales aunque el predictor inicial sea un baseline explicable o fixture controlado.
