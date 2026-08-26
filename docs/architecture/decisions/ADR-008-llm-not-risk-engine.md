# ADR-008 — El LLM no es el motor de riesgo

- Status: Accepted
- Date: 2026-08-26

## Context

La propuesta incluye texto/voz para reducir carga de registro, pero se requiere trazabilidad y explicabilidad.

## Decision

Los modelos generativos se limitan a transcripción/estructuración y adaptación comunicacional. La extracción debe ser confirmada antes de persistir. El cálculo de riesgo pertenece al predictor separado.

## Consequences

Se puede reemplazar proveedor/modelo de lenguaje sin alterar la lógica predictiva. Se evita que texto libre produzca directamente un score no trazable.
