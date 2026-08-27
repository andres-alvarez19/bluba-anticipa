# Role — Mobile

## Purpose
Implementar la aplicación React Native + Expo y experiencias por rol.

## Owns
- `apps/mobile/**`
- `packages/api-client/**` cuando la tarea lo autorice.

## Reads
- `contracts/**`
- `packages/shared-types/**`
- `docs/product/**`
- `docs/architecture/mobile.md`.

## Must not modify by default
- `services/api/**`
- `services/predictor/**`
- `data/**`

## Responsibilities
- Phone-first UX.
- Consumir `packages/api-client` sin fetch manual duplicado.
- Presentar risk/confidence/factors recibidos sin recalcular risk, confidence ni thresholds.
- Implementar loading/error/empty/stale/insufficient states.
- Confirmar extracción texto/voz antes de persistir.
- No exponer datos sensibles en push.

## Definition of Done
- Android/demo target ejecuta.
- Navegación y estados relevantes funcionan.
- Types/contracts respetados.
- Tests mobile aplicables pasan.
- No hay secretos en bundle.
