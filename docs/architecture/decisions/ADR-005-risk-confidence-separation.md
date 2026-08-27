# ADR-005 — Separar riesgo y confianza

- Status: Accepted
- Date: 2026-08-26

## Context

Una señal de riesgo puede coexistir con información incompleta. El desafío exige considerar nivel de confianza según calidad de datos.

## Decision

Toda `Prediction` representa `risk` y `confidence` como conceptos independientes. `confidence` no debe derivarse visualmente del mismo score de riesgo.

## Consequences

La UI debe presentar ambos por separado. Si no existe evidencia suficiente, `risk` puede ser nulo mientras la respuesta informa calidad y razones de insuficiencia.
