# ADR-009 — Arquitectura mobile por features

- Status: Accepted
- Date: 2026-08-26

## Context

Varios agentes pueden implementar flujos mobile simultáneamente. Una estructura únicamente por tipo de archivo aumenta colisiones.

## Decision

Organizar `apps/mobile/src/features/` por capacidad de producto (`risk`, `daily-record`, `assistant`, etc.) y mantener servicios transversales separados.

## Consequences

Mejora ownership por feature y permite vertical slices. Los componentes UI verdaderamente genéricos permanecen en `components/ui`.
