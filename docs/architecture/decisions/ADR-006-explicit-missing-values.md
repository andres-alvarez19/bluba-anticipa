# ADR-006 — Datos faltantes explícitos

- Status: Accepted
- Date: 2026-08-26

## Context

Los registros cotidianos pueden ser incompletos o inconsistentes. Interpretar ausencia como normalidad sesga la inferencia.

## Decision

Preservar estado `unknown`/faltante explícito. Si un algoritmo imputa un valor, mantener un indicador de que el dato original faltaba.

## Consequences

Contratos y feature engineering deben distinguir `unknown` de valores normales/negativos. La calidad de datos puede disminuir la confianza.
