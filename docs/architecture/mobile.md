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
- API types se generan/derivan desde contratos compartidos; no duplicar DTOs manualmente si puede evitarse.
- Mobile muestra `insufficient_data` de forma explícita y no inventa un score.
- Loading, error, empty y stale states son parte del flujo normal.
- Audio es voluntario; su transcripción/estructuración requiere confirmación antes de persistir.
- Push notifications no incluyen datos sensibles ni porcentajes de riesgo; abren la app autenticada para detalle.
- No almacenar secretos en bundle.

## Experiencias por rol

Una app, un backend, un predictor; las diferencias de experiencia se resuelven por roles/permisos y componentes de presentación, no mediante tres aplicaciones separadas.
