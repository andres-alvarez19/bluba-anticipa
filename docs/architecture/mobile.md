# Arquitectura mobile

## Stack objetivo

- React Native.
- Expo.
- TypeScript.
- Expo Router para navegación.
- TanStack Query para server state.
- Estado local mínimo; Zustand solo cuando exista estado transversal que lo justifique.

## Organización por features

```text
apps/mobile/src/
├── features/
│   ├── auth/
│   ├── home/
│   ├── risk/
│   ├── daily-record/
│   ├── assistant/
│   ├── history/
│   ├── recommendations/
│   └── feedback/
├── services/
│   ├── api/
│   ├── storage/
│   ├── notifications/
│   └── audio/
├── components/ui/
├── navigation/
├── theme/
└── utils/
```

## Reglas

- Pantallas primary diseñadas para teléfono, no desktop responsive.
- API types se generan/derivan desde `contracts/openapi.yaml`; consumirlos mediante `packages/api-client`.
- No duplicar fetch manual ni DTOs HTTP cuando el API client ya cubre el endpoint.
- Mobile muestra `INSUFFICIENT_DATA` de forma explícita y no inventa un score.
- Mobile puede traducir `LOW`/`MEDIUM`/`HIGH` a labels visuales, pero no calcula thresholds desde scores.
- Risk, confidence, factors, horizon y timestamps vienen del Backend; mobile solo presenta/formatea.
- Loading, error, empty y stale states son parte del flujo normal.
- Audio es voluntario; su transcripción/estructuración requiere confirmación antes de persistir.
- Push notifications no incluyen datos sensibles ni porcentajes de riesgo; abren la app autenticada para detalle.
- No almacenar secretos en bundle.

## Experiencias por rol

Una app, un backend, un predictor; las diferencias de experiencia se resuelven por roles/permisos y componentes de presentación, no mediante tres aplicaciones separadas.

## Stage C

La pantalla demo vigente es `Estado de hoy`.

Flujo:

```text
createDemoSession FAMILY
  -> listAuthorizedChildren
  -> getCurrentRiskPrediction
  -> presentation layer
```

El botón de registro demo no pertenece al flujo principal y solo puede exponerse como herramienta técnica condicionada por configuración explícita.
