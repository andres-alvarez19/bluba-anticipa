# ADR-011 — Tipos del cliente derivados de OpenAPI

- Status: Accepted
- Date: 2026-08-26

## Context

BOOTSTRAP-01 introdujo tipos TypeScript manuales para `DailyRecord` y `Prediction`. Los contratos finalizados evolucionaron significativamente y esos tipos quedaron desalineados inmediatamente. Mantener DTOs escritos a mano convierte `packages/shared-types` en una segunda fuente de verdad.

## Decision

Los tipos HTTP utilizados por `apps/mobile` y `packages/api-client` deben generarse o derivarse automáticamente desde `contracts/openapi.yaml`.

Para Stage B se adopta `openapi-typescript` como generador de tipos. El API client puede seguir siendo un wrapper pequeño y explícito, pero sus request/response types deben referenciar el output generado.

`packages/shared-types` se reserva para:

- tipos internos no representados en OpenAPI;
- aliases/reexports del código generado;
- utilidades estrictamente no contractuales.

No se escribirán manualmente DTOs HTTP duplicados.

## Consequences

- Un cambio de OpenAPI requiere regenerar tipos.
- CI debe verificar que el código generado está sincronizado con `contracts/openapi.yaml`.
- Mobile no conoce directamente `PredictionEngineInput`/`PredictionEngineOutput`; consume DTOs externos como `RiskPrediction`.
- El drift contractual se detecta antes de integrar features.
