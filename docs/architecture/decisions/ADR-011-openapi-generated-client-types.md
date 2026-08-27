# ADR-011 — Tipos del cliente derivados de OpenAPI

- Status: Accepted
- Date: 2026-08-26

## Context

Los contratos HTTP evolucionan durante el MVP. Mantener DTOs escritos a mano en mobile o paquetes compartidos crea una segunda fuente de verdad y aumenta el riesgo de drift.

## Decision

Los tipos HTTP usados por `apps/mobile` y `packages/api-client` deben generarse o derivarse desde `contracts/openapi.yaml`.

Stage C usa `openapi-typescript`. El API client puede seguir siendo un wrapper pequeño y explícito, pero sus request/response types referencian el output generado.

`packages/shared-types` queda reservado para tipos internos no representados en OpenAPI, aliases/reexports o utilidades no contractuales.

## Consequences

- Cambios de OpenAPI requieren regenerar/verificar tipos.
- CI ejecuta `make generate-check`.
- Mobile consume DTOs públicos como `RiskPrediction`.
- Mobile no conoce `PredictionEngineInput` ni importa el predictor.
