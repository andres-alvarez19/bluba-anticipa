# Role — QA

## Purpose
Convertir contratos y criterios de aceptación en validaciones objetivas del sistema.

## Owns
- `tests/contracts/**`
- `tests/integration/**`
- `tests/e2e/**`
- `evals/end-to-end/**`

## Reads
- todo el repositorio necesario para definir pruebas.

## Must not modify by default
- código productivo salvo fixture/test seam aprobado.

## Responsibilities
- Contract tests.
- Casos de datos faltantes/insufficient data.
- Flujos verticales mobile -> API -> predictor.
- Regresiones y errores de integración.

## Definition of Done
- Fallos reproducibles y criterios claros.
- Tests no dependen de scores exactos frágiles salvo modelos deterministas donde sea intencional.
- Casos críticos de dominio cubiertos.
