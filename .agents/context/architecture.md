# Contexto de arquitectura

## Componentes

```text
Mobile (React Native + Expo)
        |
      HTTPS
        v
API (FastAPI)
   |        \
   |         -> Predictor (Python)
   v
PostgreSQL
```

## Principios

- Monorepo con límites de ownership claros.
- Contract-first: `contracts/` precede a implementaciones.
- Mobile consume API y presenta resultados; no calcula riesgo.
- API orquesta persistencia, feature assembly e inferencia.
- Predictor expone una interfaz de dominio `predict(features) -> Prediction` y no conoce UI/HTTP.
- Riesgo, confianza y calidad de datos viajan separados.
- Fixtures permiten desarrollar mobile y API antes de tener un modelo final.

## Layout objetivo

```text
apps/mobile/
services/api/
services/predictor/
packages/api-client/
packages/shared-types/
packages/shared-config/
contracts/
data/
evals/
tests/
docs/
.agents/
```

La etapa A define gobierno y contratos; el scaffold ejecutable se crea en la etapa de bootstrap técnico.
