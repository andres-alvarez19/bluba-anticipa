# ADR-001 — Monorepo

- Status: Accepted
- Date: 2026-08-26

## Context

Mobile, API y predictor deben evolucionar rápidamente y compartir contratos durante la hackatón.

## Decision

Usar un monorepo con `apps/`, `services/`, `packages/`, `contracts/`, `docs/`, `data/`, `evals/` y `.agents/`.

## Consequences

Facilita cambios atómicos y contract tests. Exige ownership y worktrees/ramas para evitar colisiones entre agentes.
