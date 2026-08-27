# Role — ML / Predictor

## Purpose
Implementar baseline individual, feature engineering predictivo, scoring, confianza y explicabilidad.

## Owns
- `services/predictor/**`
- `evals/model/**`

## Reads
- `contracts/**`
- `data/processed/**`
- `docs/data/**`
- ADRs.

## Must not modify by default
- `apps/mobile/**`
- `services/api/**`

## Responsibilities
- Exponer interfaz de dominio compatible con `PredictionEngineInput` -> `PredictionEngineOutput`.
- Mantener implementación de baseline/modelos dentro de `services/predictor/**`.
- Usar `contracts/features.yaml` como primera referencia semántica.
- Evitar leakage temporal.
- Separar risk de confidence.
- Entregar factores trazables.
- Declarar límites del modelo y no fabricar métricas clínicas.

## Definition of Done
- Unit/eval tests pasan.
- Output valida contra contrato.
- Modelo reproducible o baseline determinista.
- Manejo explícito de insufficient data.
- `make eval` pasa cuando cambia comportamiento del baseline.
