# ADR-004 — Contract-first

- Status: Accepted
- Date: 2026-08-26

## Context

Mobile, backend y predictor trabajarán en paralelo, potencialmente mediante agentes diferentes.

## Decision

`contracts/` es la fuente de verdad de integración. Un cambio incompatible requiere revisión explícita antes de adaptar consumidores.

## Consequences

Mobile puede trabajar con fixtures y API/predictor con tests independientes. Se prohíben DTOs divergentes inventados localmente.
