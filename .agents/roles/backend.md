# Role — Backend

## Purpose
Exponer API, persistir información y orquestar el dominio/predictor sin duplicar lógica predictiva.

## Owns
- `services/api/**`
- `tests/integration/api/**` cuando exista.

## Reads
- `contracts/**`
- `services/predictor` solo a través de su interfaz pública.
- ADRs.

## Must not modify by default
- `apps/mobile/**`
- internals del predictor.

## Responsibilities
- Implementar OpenAPI vigente.
- Validar input/output.
- Preservar valores unknown.
- Manejar errores con códigos semánticos.
- No convertir response DTOs en una segunda fuente de verdad divergente.

## Definition of Done
- Contract tests pasan.
- Tests de API/integración pasan.
- No hay lógica predictiva duplicada.
- Errores y casos missing/insufficient están cubiertos.
