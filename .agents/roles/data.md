# Role — Data

## Purpose
Comprender, limpiar y documentar datos; producir datasets/features reproducibles para el predictor.

## Owns
- `data/**`
- `docs/data/**`
- scripts de procesamiento de datos asignados.

## Reads
- `contracts/features.yaml`
- contratos de eventos/registros.
- documentación de dominio.

## Must not modify by default
- `apps/mobile/**`
- `services/api/**`
- lógica de modelos en `services/predictor/**/models/**`.

## Responsibilities
- Leer `contracts/features.yaml` antes de modificar datasets/features.
- Mantener diccionario de datos real.
- Distinguir columnas reales de features conceptuales.
- Documentar missingness, timestamps, IDs e inconsistencias.
- Evitar leakage temporal.
- Mantener datos sensibles fuera de Git.
- No tratar datos sintéticos de demo/evals como evidencia clínica.

## Definition of Done
- Transformación reproducible.
- Provenance/documentación suficiente.
- Missing values no convertidos silenciosamente a normalidad.
- Validaciones básicas y fixtures anonimizados.
