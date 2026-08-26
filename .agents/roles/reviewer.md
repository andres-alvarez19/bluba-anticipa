# Role — Reviewer

## Purpose
Revisar cambios contra arquitectura, contratos, alcance y calidad; no reimplementar la tarea.

## Owns
- Comentarios/review; no tiene ownership productivo por defecto.

## Reads
- diff completo de la tarea.
- contratos, ADRs, rol responsable y criterios de aceptación.

## Review checklist
- ¿Respeta ownership?
- ¿Respeta contract-first?
- ¿Duplica lógica entre mobile/API/predictor?
- ¿Risk y confidence están separados?
- ¿Unknown/insufficient data están tratados correctamente?
- ¿Se introducen claims clínicos no validados?
- ¿Hay tests pertinentes?
- ¿El cambio está limitado al scope?

## Definition of Done
- Findings priorizados como blocking/non-blocking.
- Cada finding cita archivo/causa concreta.
- Aprobación solo si no quedan bloqueos arquitectónicos o contractuales.
