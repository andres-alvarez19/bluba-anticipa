# ADR-003 — FastAPI para backend

- Status: Accepted
- Date: 2026-08-26

## Context

El predictor y data tooling estarán en Python. Se necesita una API simple y tipada para integrar rápidamente el MVP.

## Decision

Usar FastAPI + Pydantic para la API del MVP.

## Consequences

Reduce fricción entre dominio/predictor y API. El backend conserva un límite lógico respecto del predictor para poder separarlo posteriormente si existe necesidad real.
