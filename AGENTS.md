# Bluba Anticipa — Agent Constitution

## 1. Propósito

Este archivo define las reglas globales para humanos y agentes que modifiquen el repositorio. Antes de implementar una tarea, leer este archivo y los documentos específicos del área.

## 2. Fuentes de verdad

En caso de conflicto, aplicar este orden:

1. `contracts/` — contratos de integración y features.
2. `docs/architecture/decisions/` — ADRs aceptados.
3. `docs/architecture/` — arquitectura vigente.
4. `docs/product/mvp.md` — alcance del MVP.
5. `.agents/context/` — contexto resumido para agentes.

No inventar un contrato local para resolver un desacuerdo con una fuente superior.

## 3. Arquitectura obligatoria

- Bluba Anticipa es **mobile-first**. El cliente principal es React Native + Expo.
- No introducir un frontend web salvo requerimiento explícito aprobado mediante ADR.
- Mobile no implementa ni replica lógica predictiva.
- Backend orquesta dominio, persistencia y exposición de API; no replica algoritmos del predictor.
- Predictor no depende de mobile ni de detalles HTTP del backend.
- Los límites entre componentes se expresan mediante `contracts/`.
- Una modificación incompatible de contrato requiere workflow `contract-change`.

## 4. Reglas de dominio

- `risk` y `confidence` son conceptos independientes.
- Ausencia de información **no** equivale a normalidad.
- Los datos faltantes deben conservarse explícitamente como desconocidos y afectar la calidad/confianza cuando corresponda.
- Una predicción puede quedar en estado `insufficient_data`; no fabricar un score cuando la evidencia es insuficiente.
- El sistema es una herramienta de apoyo preventivo, no un sistema diagnóstico ni un predictor infalible.
- No afirmar precisión clínica, sensibilidad u otras métricas que no hayan sido validadas con datos suficientes.
- Un LLM puede estructurar lenguaje natural y adaptar redacción, pero **no es el motor de riesgo**.
- Las recomendaciones deben provenir de estrategias profesionales, historial de éxito o catálogo validado; un modelo generativo no debe inventar intervenciones clínicas.
- Toda extracción desde texto/voz debe permitir confirmación humana antes de persistir información estructurada.

## 5. Privacidad y seguridad

- Minimizar datos personales y sensibles.
- No registrar secretos, tokens, audio crudo o datos identificables en fixtures del repositorio.
- Usar identificadores anonimizados en pruebas.
- Evitar información sensible en notificaciones push; el detalle pertenece a la app autenticada.
- Aplicar control de acceso por rol cuando se implemente autorización.

## 6. Ownership

Cada rol declara `owns`, `reads` y `must_not_modify` en `.agents/roles/`.

Reglas:

- No modificar archivos fuera de `owns` salvo que la tarea lo autorice expresamente.
- Si una tarea exige cambiar un contrato, detener la implementación local y seguir `.agents/workflows/contract-change.yaml`.
- Evitar cambios de formato o refactors no relacionados fuera del área propia.
- Para trabajo paralelo, usar ramas/worktrees independientes.

## 7. Flujo de implementación

Antes de modificar código:

1. Identificar el rol responsable.
2. Leer contrato(s) aplicables.
3. Leer ADRs relevantes.
4. Confirmar criterios de aceptación.
5. Ejecutar pruebas base del área cuando existan.
6. Implementar el cambio mínimo coherente.
7. Agregar/actualizar tests.
8. Ejecutar validaciones del área y contract tests.
9. Documentar decisiones nuevas que requieran ADR.

## 8. Definition of Done global

Una tarea no está terminada si:

- viola un contrato vigente;
- introduce lógica duplicada entre mobile/API/predictor;
- no maneja errores, loading/empty states o datos faltantes cuando aplican;
- tests relevantes fallan;
- agrega una decisión arquitectónica relevante sin ADR;
- mezcla claims clínicos no validados con resultados del prototipo;
- persiste una extracción de IA sin confirmación cuando la entrada proviene de lenguaje natural.

## 9. Interfaz de comandos del harness

La etapa de bootstrap implementará una interfaz estable mediante `make`. Los nombres reservados son:

- `make setup`
- `make dev`
- `make mobile`
- `make api`
- `make predictor`
- `make test`
- `make test-mobile`
- `make test-api`
- `make test-model`
- `make contracts`
- `make lint`
- `make eval`

Los agentes deben preferir estos comandos cuando estén disponibles en vez de depender de comandos internos de cada stack.
