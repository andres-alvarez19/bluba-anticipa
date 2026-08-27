# ADR-007 — Límite lógico del predictor

- Status: Accepted
- Date: 2026-08-26

## Context

El MVP necesita velocidad, pero la lógica predictiva debe ser testeable y reemplazable.

## Decision

El predictor vive en `services/predictor` y expone una interfaz de dominio equivalente a `predict(PredictionEngineInput) -> PredictionEngineOutput`, definida por `contracts/prediction.schema.json`. Puede ejecutarse en el mismo proceso del backend durante el MVP sin perder ese límite lógico.

## Consequences

No se introduce un microservicio por defecto. API no replica scoring/weights y predictor no conoce rutas HTTP, SQLAlchemy ni componentes mobile.
