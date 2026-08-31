# Bluba Anticipa — Brief técnico para la demo final en video

**Documento objetivo para Codex / agentes de implementación**  
**Ruta recomendada dentro del repositorio:** `docs/demo/Bluba_Anticipa_Demo_Final_Brief.md`

---

## 1. Objetivo

El objetivo de esta tarea no es ampliar el producto ni completar todo el MVP móvil. El objetivo es dejar una **demo audiovisual final, estable, reproducible y técnicamente honesta** que comunique con claridad el diferencial de Bluba Anticipa ante el jurado de NeuroHack 2026.

La retroalimentación del equipo evaluador destacó explícitamente dos puntos:

1. **La sustitución de formularios extensos por notas de voz analizadas mediante IA/NLP constituye una ventaja competitiva.**
2. **El prototipo debe mostrarse de forma más gráfica y concreta para que se entienda cómo funcionaría en la realidad.**

Por lo tanto, el nuevo vertical slice debe hacer visible el recorrido completo desde una observación cotidiana en lenguaje natural hasta la actualización preventiva compartida por familia, escuela y especialista.

La demo final debe permitir que una persona del jurado entienda, sin conocer la arquitectura interna, lo siguiente:

> Una familia puede contar en pocos segundos qué ocurrió. Bluba Anticipa convierte esa observación en variables estructuradas, solicita confirmación humana, incorpora el registro al historial longitudinal, recalcula el estado preventivo y hace visible el nuevo riesgo, confianza y factores explicativos para los distintos actores.

---

## 2. Resultado no negociable

Debe funcionar de extremo a extremo este flujo:

```text
Familia habla o escribe
        ↓
Bluba recibe la observación
        ↓
Voz → transcripción
        ↓
Texto → extracción de variables
        ↓
ObservationDraft pendiente
        ↓
Usuario revisa / corrige
        ↓
Usuario confirma
        ↓
DailyRecord confirmado
        ↓
Backend persiste
        ↓
FeatureBuilder reconstruye estado
        ↓
Predictor recalcula
        ↓
Nueva RiskPrediction
        ↓
Familia ve el cambio
        ↓
Profesor y especialista ven la misma predicción
```

La voz debe ser la funcionalidad protagonista. La escritura debe mostrarse como una segunda vía que reutiliza el mismo pipeline.

---

# 3. Estado actual verificado del repositorio

## 3.1 Superficie de demo

Existe `apps/demo-web`, autorizada mediante `ADR-013` exclusivamente como superficie secundaria para demostración técnica y grabación audiovisual.

La demo web:

- usa React + Vite + TypeScript;
- consume Backend a través de `@bluba/api-client`;
- tiene un modo específico de video mediante `?demo=video`;
- ya muestra familia, profesor y especialista;
- ya consume una `RiskPrediction` real;
- ya permite que un registro escolar confirmado provoque persistencia y recálculo;
- no debe convertirse en frontend web productivo.

El script actual:

```bash
make demo
```

prepara la base, levanta API y `demo-web`, y expone:

```text
http://localhost:5173/?demo=video
```

---

## 3.2 Vertical slice predictivo existente

Actualmente ya existe la parte difícil del flujo predictivo:

```text
DailyRecord confirmado
        ↓
services/api
        ↓
PredictionService
        ↓
FeatureBuilder / predictor
        ↓
RiskPrediction
        ↓
apps/demo-web
```

Este flujo debe preservarse.

**No se debe crear scoring en frontend.**  
**No se debe llamar al predictor directamente desde `demo-web`.**  
**No se debe reemplazar el predictor para resolver la captura por voz/texto.**

---

## 3.3 UI de voz y texto existente

`apps/demo-web/src/components/QuickReportModal.tsx` ya contiene una experiencia visual avanzada para:

- `Grabar audio`;
- `Escribir texto`;
- estado de grabación;
- estado de transcripción;
- guía de variables relevantes;
- variables extraídas;
- edición;
- confirmación;
- estado de guardado/éxito.

Sin embargo, hoy es una simulación.

Actualmente existen:

- una transcripción fija de demo (`DEMO_TRANSCRIPT_VOICE`);
- un texto precargado (`DEMO_TEXT_PRESET`);
- variables extraídas inicializadas de forma local;
- `setTimeout` que simula transcripción/procesamiento.

La nueva implementación debe conservar la calidad visual del modal, pero sustituir la simulación por el pipeline real.

---

## 3.4 Problema de acceso al reporte rápido en video

`TodayStatusScreen` declara la prop:

```ts
onOpenQuickReport?: (mode: 'text' | 'voice') => void;
```

pero en el estado actual no la utiliza en el cuerpo de la pantalla.

Además, en `?demo=video`, `MobileBottomNav` está oculto.

Esto significa que la funcionalidad que el jurado quiere ver puede no tener un acceso visual directo desde la escena inicial de Familia.

### Requisito

La pantalla de Familia debe mostrar un CTA evidente y filmable, por ejemplo:

```text
[ 🎙 Registrar observación ]
```

o dos acciones:

```text
[ 🎙 Contarlo por voz ]   [ ✎ Escribir ]
```

No debe depender de navegar por menús ocultos o de usar controles externos al teléfono simulado.

---

## 3.5 Contratos de captura ya definidos

`contracts/openapi.yaml` ya define operaciones para:

```text
POST  /v1/observation-drafts/text
POST  /v1/observation-drafts/audio
PATCH /v1/observation-drafts/{draftId}
POST  /v1/observation-drafts/{draftId}/confirm
```

El contrato ya modela el comportamiento esperado:

- un texto crea un borrador, no un registro definitivo;
- un audio se transcribe y estructura en un borrador;
- el borrador queda `PENDING_CONFIRMATION`;
- el usuario puede corregirlo;
- solo después de confirmar se crea un `DailyRecord`;
- la procedencia final debe ser `AI_EXTRACTED_HUMAN_CONFIRMED`.

Por defecto **no debe modificarse `contracts/`** para esta tarea. Si Codex detecta una incompatibilidad contractual real, debe activar el workflow `contract-change` y justificarla antes de tocar consumidores.

---

## 3.6 Backend incompleto respecto del contrato

El Backend actual implementa, entre otros:

```text
POST /v1/children/{childId}/daily-records
GET  /v1/children/{childId}/risk-predictions/current
GET  /v1/children/{childId}/preventive-status
POST /v1/children/{childId}/dysregulation-events
```

Pero no implementa todavía las rutas de `observation-drafts`.

Este es el principal hueco de Backend para la demo.

---

## 3.7 API client incompleto

`packages/api-client` actualmente expone las operaciones principales de sesión, children, DailyRecord, prediction y preventive status, pero no expone aún las operaciones de captura NLP.

Debe incorporar, usando los tipos derivados de OpenAPI:

```ts
createTextObservationDraft(...)
createAudioObservationDraft(...)
patchObservationDraft(...)
confirmObservationDraft(...)
```

Debe continuar siendo la única frontera usada por `demo-web` para consumir Backend.

### Importante: multipart

El helper actual añade `Content-Type: application/json` por defecto.

Para audio se enviará `FormData`. En ese caso no debe fijarse manualmente `Content-Type`; el runtime debe crear el boundary de `multipart/form-data`.

---

# 4. Arquitectura objetivo para captura

La arquitectura de demo debe ser pequeña y reemplazable.

```text
apps/demo-web
    │
    ├── texto
    │
    └── audio Blob
          │
          ▼
@bluba/api-client
          │
          ▼
services/api
          │
          ├── TranscriptionService
          │       audio → texto
          │
          ├── ObservationExtractionService
          │       texto → features propuestas
          │
          └── ObservationDraftService
                  crear / editar / confirmar
                         │
                         ▼
                   DailyRecord
                         │
                         ▼
                 PredictionService
                         │
                         ▼
                  RiskPrediction
```

## 4.1 Regla de responsabilidad

El componente generativo/NLP:

- **puede** transcribir;
- **puede** estructurar lenguaje cotidiano;
- **puede** proponer variables;
- **no puede** calcular el riesgo;
- **no puede** decidir thresholds;
- **no puede** inventar recomendaciones clínicas.

El predictor continúa siendo responsable del riesgo.

---

# 5. Extracción desde texto

## Entrada filmable

Ejemplo:

> “Anoche Mateo durmió cinco horas y media y se despertó dos veces. Amaneció más irritable y hoy nos avisaron que habrá un acto especial en el colegio con mucho ruido.”

El Backend debe generar un `ObservationDraft` con variables compatibles con los contratos, por ejemplo:

```text
sleep_quality        = interrumpido
sleep_hours          = 5.5
wake_state           = irritable_llorando
routine_change       = true
observed_behavior    = [...]
```

No es necesario extraer todas las variables posibles. Es preferible una extracción conservadora y correcta antes que completar datos no mencionados.

### Regla crítica

**Ausencia de una variable en el texto no equivale a normalidad.**

No completar silenciosamente valores desconocidos como normales.

---

# 6. Captura por voz

Para el video no se requiere streaming.

La implementación preferida es:

```text
getUserMedia({ audio: true })
        ↓
MediaRecorder
        ↓
Blob
        ↓
FormData
        ↓
POST /v1/observation-drafts/audio
        ↓
transcripción
        ↓
extracción
        ↓
ObservationDraft
```

La UI debe mostrar estados claros:

```text
Listo para grabar
→ Grabando
→ Procesando audio
→ Transcripción disponible
→ Información detectada
```

### Grabación

Debe funcionar en el navegador usado para filmar la demo en `localhost`.

Se debe manejar:

- permiso de micrófono rechazado;
- navegador sin `MediaRecorder`;
- grabación vacía;
- error de red;
- error de transcripción.

Para el video debe existir un camino de recuperación simple, sin dejar el modal bloqueado.

---

# 7. Proveedor de transcripción y extracción

La implementación debe ocultar cualquier proveedor externo detrás de interfaces internas de Backend.

Ejemplo conceptual:

```python
class TranscriptionService:
    async def transcribe(...) -> str:
        ...

class ObservationExtractionService:
    async def extract(text: str, ...) -> ExtractedObservation:
        ...
```

No exponer claves en Vite ni llamar al proveedor desde React.

## 7.1 Seguridad de secretos

Nunca:

```text
VITE_OPENAI_API_KEY
VITE_*_SECRET
```

Las credenciales, si existen, deben vivir únicamente en Backend mediante variables de entorno.

---

# 8. Modo real + resiliencia para grabación

La demo final no puede depender de que una API externa se comporte perfectamente durante la filmación.

Se debe diseñar una estrategia reproducible.

Recomendación:

```text
BLUBA_CAPTURE_MODE=provider
BLUBA_CAPTURE_DEMO_FALLBACK=true
```

Conceptualmente:

```text
proveedor disponible
    → transcripción/extracción real

fallo externo controlado
    → fixture determinístico de demostración
```

El fallback:

- debe vivir en Backend/demo tooling;
- debe ser explícito en código/configuración;
- no debe crear scoring en frontend;
- debe producir el mismo tipo contractual de `ObservationDraft`;
- no debe persistirse como si fuese una capacidad clínica validada.

El modo de producción futura no es parte de esta tarea.

---

# 9. Confirmación humana

La demo debe hacer visible este paso:

```text
IA interpretó:

✓ Sueño interrumpido
✓ 5.5 horas
✓ Despertar irritable
✓ Cambio de rutina

[ Editar ]     [ Confirmar ]
```

El usuario debe poder corregir al menos una variable antes de confirmar.

La confirmación debe llamar a:

```text
POST /v1/observation-drafts/{draftId}/confirm
```

y producir un registro con procedencia:

```text
AI_EXTRACTED_HUMAN_CONFIRMED
```

El borrador no confirmado no debe alimentar el predictor.

---

# 10. Persistencia y recálculo

Después de confirmar:

```text
ObservationDraft confirmado
        ↓
DailyRecord
        ↓
persistencia existente
        ↓
PredictionService.evaluate_current(childId)
        ↓
nueva RiskPrediction
```

La implementación debe reutilizar el camino de dominio existente en Backend.

Evitar crear una segunda versión de:

- persistencia de DailyRecord;
- FeatureBuilder;
- predictor;
- cálculo de riesgo;
- cálculo de confianza.

---

# 11. Actualización visual posterior a la confirmación

Actualmente `QuickReportModal` comunica éxito de forma local.

La nueva versión debe, después de confirmar:

1. mostrar visualmente `Registro confirmado`;
2. indicar `Actualizando estado preventivo…`;
3. solicitar la nueva predicción al Backend;
4. cerrar o avanzar el modal;
5. renderizar la nueva `RiskPrediction`;
6. hacer visible el cambio sin que el usuario tenga que refrescar manualmente.

Idealmente se debe poder filmar una transición:

```text
ANTES
Índice preventivo moderado
        ↓
nota de voz + confirmación
        ↓
DESPUÉS
Índice preventivo elevado
```

No hardcodear esa transición en React. El escenario de seed debe provocar el resultado mediante el predictor real.

---

# 12. Escenario determinístico para el video

El escenario de demo debe estar preparado desde seed/tooling, no desde estado predictivo inventado en frontend.

## Estado inicial

El niño de demo debe tener suficiente historial para que la predicción inicial sea visualmente creíble y permita demostrar baseline.

## Observación familiar

Usar una frase aproximadamente equivalente a:

> “Anoche Mateo durmió cinco horas y media, se despertó dos veces y hoy amaneció bastante irritable. Además nos avisaron que habrá un acto especial en el colegio con mucho ruido.”

## Resultado

La combinación del historial existente + registro confirmado debe provocar un cambio demostrable en la predicción.

No exigir un score exacto frágil si el predictor no lo garantiza. Sí exigir un cambio semántico filmable, por ejemplo:

```text
MODERATE → ELEVATED
```

o un cambio relevante dentro del escenario actual, definido a partir de la salida real del modelo.

## Requisito de QA

El test E2E debe comprobar el comportamiento semántico del escenario y no depender innecesariamente de un número exacto.

---

# 13. Propagación entre roles

Después de confirmar el registro, la demo debe demostrar que no existen tres predicciones distintas.

Cambiar:

```text
Familia
→ Profesor
→ Especialista
```

y comprobar que los tres consumen la misma predicción actual del Backend, adaptada únicamente en presentación.

El frontend no puede recalcular ni reinterpretar el nivel.

---

# 14. Vista de Familia para el video

La escena inicial debe priorizar tres elementos:

1. estado preventivo;
2. CTA de registro rápido;
3. recomendación/factores.

No dedicar la grabación a navegación secundaria.

Debe existir un CTA visible en el viewport inicial para:

```text
🎙 Registrar por voz
```

y una alternativa:

```text
✎ Escribir observación
```

La voz debe ser visualmente prioritaria.

---

# 15. Vista de revisión NLP

Esta es una de las escenas clave del video.

Debe mostrar simultáneamente, cuando el espacio lo permita:

- transcripción;
- mensaje equivalente a `Información detectada`;
- variables estructuradas;
- affordance para editar;
- CTA de confirmar.

La audiencia debe entender la transformación:

```text
“durmió 5.5 horas...”
        ↓
Sueño = interrumpido
Horas = 5.5
Despertar = irritable
Cambio de rutina = sí
```

No mostrar JSON al jurado.

---

# 16. Alternativa por escritura

La escritura debe reutilizar exactamente el mismo modelo de draft y confirmación.

No crear dos pipelines separados.

Para el video basta una escena breve:

```text
Escribir texto
→ Analizar
→ mostrar variables detectadas
```

No repetir toda la secuencia si la voz ya mostró revisión y confirmación.

---

# 17. Baseline y explicabilidad

El video debe mostrar durante algunos segundos el principio diferenciador:

```text
Habitual de Mateo       Hoy
7.8 h sueño             5.5 h
despertar tranquilo     irritable
rutina estable          cambio
```

La pantalla actual ya contiene componentes de comparación baseline vs valor actual.

Preservar y aprovechar esos elementos.

El mensaje conceptual es:

> Bluba Anticipa no compara principalmente a Mateo contra otros niños; identifica cambios respecto de su propio patrón longitudinal.

No añadir claims de precisión clínica.

---

# 18. Recomendaciones

La demo puede mostrar una recomendación preventiva al final.

Debe provenir del mecanismo existente/controlado, no de una generación clínica libre.

La escena debe comunicar:

```text
Riesgo + explicación
        ↓
acción preventiva comprensible
```

No hace falta extender el motor de recomendaciones para esta tarea si el escenario existente ya ofrece una acción útil.

---

# 19. Alcance de cambios permitido

## Prioridad P0

### Backend

- implementar endpoints de `observation-drafts` ya definidos;
- servicios de transcripción/extracción;
- creación, edición y confirmación de draft;
- integrar confirmación con DailyRecord/predicción existente;
- manejo de errores;
- tests.

### `packages/api-client`

- exponer operaciones Capture;
- soporte correcto de JSON y `FormData`;
- usar tipos generados del OpenAPI.

### `apps/demo-web`

- MediaRecorder real;
- envío de texto real;
- consumir ObservationDraft real;
- revisión/corrección;
- confirmación real;
- refresh de predicción;
- CTA visible en Familia;
- estados de loading/error/retry;
- mantener `?demo=video`.

### Demo tooling

- reset determinístico;
- escenario filmable;
- fallback opcional de captura;
- runbook de grabación.

### QA

- contract checks;
- integración de endpoints;
- E2E de texto;
- E2E de confirmación → nueva predicción;
- tests frontend para estados principales;
- smoke de voz cuando sea razonable automatizarlo.

---

# 20. Cambios que no deben hacerse por defecto

No modificar salvo bloqueo demostrado:

```text
services/predictor/**
contracts/**
features del modelo
thresholds
weights
ventanas temporales
algoritmo de riesgo
```

No implementar:

- streaming de audio;
- WebSockets;
- conversación multi-turn;
- historial de chat;
- almacenamiento permanente de audio;
- diarización;
- fine-tuning;
- un modelo NLP propio;
- un frontend web productivo;
- autenticación productiva;
- infraestructura cloud productiva.

---

# 21. Privacidad de audio

Para la demo:

```text
Audio temporal
    ↓
transcripción
    ↓
extracción
    ↓
descartar binario
```

Conservar únicamente aquello permitido por contrato y necesario para trazabilidad, por ejemplo:

- `draft_id`;
- `input_type`;
- transcripción confirmada si corresponde;
- features;
- procedencia.

No agregar audio crudo a fixtures ni al repositorio.

---

# 22. Dependencias de Backend

Revisar si `multipart/form-data` requiere una dependencia adicional en FastAPI.

El `pyproject.toml` actual del API no incluye `python-multipart`.

Si el endpoint implementado con `UploadFile`/`File` lo requiere, agregar la dependencia de forma explícita y verificar setup limpio.

---

# 23. Estrategia de agentes para Codex

La tarea cruza Backend, API client, Demo Web y QA. Debe tratarse como `feature` cross-boundary.

El repositorio ya define:

```text
.agents/workflows/feature.yaml
```

que exige:

```text
identify_owner_role
read_agents_md
read_product_scope
read_applicable_contracts
read_relevant_adrs
define_acceptance_criteria
run_baseline_tests
implement_minimal_change
add_or_update_tests
run_area_tests
run_contract_tests
request_reviewer
```

y exige revisión de Architect para cambios cross-boundary.

## Agentes recomendados

### A. Architect / Orchestrator

**Primero. Read-heavy.**

Responsabilidades:

- leer `AGENTS.md`;
- leer este brief;
- revisar OpenAPI y ADR-013;
- confirmar que no se requiere cambio contractual;
- dividir el trabajo;
- definir interfaces entre Backend/API-client/demo-web;
- definir criterios de aceptación;
- impedir cambios innecesarios en predictor.

### B. Backend Agent

Scope principal:

```text
services/api/**
tests/integration/api/**
```

Objetivo:

- ObservationDraft endpoints;
- servicios de captura;
- confirmación;
- integración con persistencia/predicción;
- manejo de error/fallback.

### C. Demo Web / Integration Agent

Autorizado específicamente para esta tarea sobre:

```text
apps/demo-web/**
packages/api-client/**
```

Objetivo:

- API client;
- multipart;
- MediaRecorder;
- CTA;
- UX de voz/texto;
- confirmación;
- refresh.

Si Codex considera riesgoso que un mismo agente toque API client y UI, puede dividirlo en:

- Integration/API Client Agent;
- Demo Web Agent.

### D. QA Agent

Scope:

```text
tests/**
evals/**
tests propios de apps/demo-web cuando corresponda
```

Objetivo:

- convertir los criterios en tests;
- probar que un draft no confirmado no cambia riesgo;
- probar confirmación;
- probar coherencia cross-role;
- verificar demo reset/reproducibilidad.

### E. Reviewer

Read-only sobre el diff completo.

Debe bloquear si detecta:

- lógica predictiva en frontend;
- contrato divergente;
- persistencia antes de confirmación;
- secretos en cliente;
- audio crudo persistido;
- falta de tests;
- fallback oculto;
- claims clínicos;
- scope creep.

---

# 24. Orden de ejecución recomendado

Codex debe crear el plan definitivo después de inspeccionar el estado real del checkout.

Como marco de trabajo:

```text
Stage 0 — Discovery y baseline
Stage 1 — Diseño cross-boundary
Stage 2 — Backend text draft
Stage 3 — Confirmación → DailyRecord → predictor
Stage 4 — API client
Stage 5 — Demo-web texto real
Stage 6 — Audio real
Stage 7 — UX filmable y CTA
Stage 8 — Escenario determinístico/reset
Stage 9 — E2E y regresiones
Stage 10 — Review
Stage 11 — Demo check + runbook de grabación
```

Priorizar texto antes de audio porque permite validar:

```text
NLP → draft → confirmación → predicción
```

sin depender del micrófono.

Luego voz solo agrega:

```text
audio → transcripción
```

por delante del mismo pipeline.

---

# 25. Criterios de aceptación funcionales

La tarea está terminada cuando se pueda demostrar:

### AC-01 — Texto crea draft

Una observación escrita produce un `ObservationDraft` real con estado pendiente.

### AC-02 — Audio crea draft

Una grabación real de micrófono llega a Backend y produce transcripción + draft.

### AC-03 — Sin confirmación no hay evidencia predictiva

Crear un draft no debe crear DailyRecord ni cambiar RiskPrediction.

### AC-04 — Edición

Una variable propuesta puede corregirse antes de confirmar.

### AC-05 — Confirmación

Confirmar crea un DailyRecord con procedencia `AI_EXTRACTED_HUMAN_CONFIRMED`.

### AC-06 — Predictor real

La confirmación usa el pipeline real y genera/actualiza `RiskPrediction`.

### AC-07 — UI se actualiza

Familia muestra la nueva predicción sin refresh manual.

### AC-08 — Coherencia entre roles

Profesor y especialista consultan la misma predicción resultante.

### AC-09 — Missing preservado

Datos no mencionados no se convierten silenciosamente en normales.

### AC-10 — Errores recuperables

Permiso de micrófono, red y proveedor presentan feedback y retry.

### AC-11 — Fallback reproducible

La demo puede filmarse aun ante un fallo controlado del proveedor externo, sin mover la lógica al frontend.

### AC-12 — Reset

`make demo` o un comando documentado deja el escenario en un estado inicial conocido.

---

# 26. Criterios de aceptación para el video

La demo debe poder grabarse sin terminal visible.

## Secuencia objetivo

### Escena 1 — Familia

Se ve:

```text
Estado preventivo
+
Registrar observación
```

### Escena 2 — Voz

Usuario pulsa micrófono y habla.

### Escena 3 — IA

Se ve:

```text
Transcripción
+
variables detectadas
```

### Escena 4 — Confirmación

Usuario revisa y confirma.

### Escena 5 — Actualización

Se ve claramente:

```text
Actualizando estado preventivo…
```

seguido del nuevo estado.

### Escena 6 — Explicación / baseline

Se muestran diferencias respecto del habitual y factores principales.

### Escena 7 — Texto

Breve demostración de la segunda vía.

### Escena 8 — Profesor

Misma predicción, contexto escolar.

### Escena 9 — Especialista

Misma predicción, mayor profundidad/confianza/evolución.

### Escena 10 — Acción preventiva

Recomendación concreta y cierre.

---

# 27. Gate técnico obligatorio

Antes de considerar la demo terminada ejecutar:

```bash
make demo-check
```

Actualmente ese gate incluye:

```text
contracts
generate-check
typecheck
test
eval
lint
demo-web-build
```

Si alguna validación aplicable falla, la demo no está lista.

Además ejecutar manualmente:

```bash
make demo
```

y recorrer el guion completo desde un reset limpio.

---

# 28. Entregables que Codex debe producir

Además del código:

## 1. Plan ejecutado

Resumen por stages, agentes y dependencias.

## 2. Runbook

Crear:

```text
docs/demo/VIDEO_RUNBOOK.md
```

con:

- variables de entorno;
- proveedor/fallback;
- comando de reset;
- comando de inicio;
- navegador recomendado;
- permiso de micrófono;
- frase exacta sugerida;
- clics exactos;
- resultados esperados;
- recuperación ante fallo.

## 3. Checklist pre-grabación

Debe poder ejecutarse en pocos minutos antes de filmar.

## 4. Resumen de arquitectura

Muy corto, para responder preguntas del jurado:

```text
voz/texto
→ extracción NLP
→ confirmación humana
→ DailyRecord
→ predictor independiente
→ riesgo/confianza/explicación
```

## 5. Reporte final de validación

Incluir comandos ejecutados y resultado.

---

# 29. Restricciones de producto y comunicación

Mantener siempre:

- herramienta de apoyo preventivo;
- no sistema diagnóstico;
- índice preventivo demostrativo;
- no afirmar precisión clínica no validada;
- riesgo y confianza son independientes;
- datos faltantes no equivalen a normalidad;
- el LLM no es el predictor;
- la persona confirma antes de persistir.

---

# 30. Definition of Done final

La demo final está lista únicamente si una persona puede ejecutar:

```bash
make demo
```

abrir la URL documentada y, sin tocar código ni terminal durante la grabación:

1. entrar a Familia;
2. iniciar una nota de voz;
3. grabar audio real;
4. ver transcripción;
5. ver variables extraídas;
6. editar una variable;
7. confirmar;
8. ver `actualizando`;
9. ver una nueva predicción proveniente de Backend;
10. ver baseline/factores;
11. demostrar entrada por texto;
12. cambiar a Profesor;
13. cambiar a Especialista;
14. comprobar coherencia;
15. mostrar una acción preventiva;
16. cerrar la demo sin errores visibles.

El producto que debe quedar en pantalla no es “una aplicación con IA”.

Debe quedar claro visualmente que:

> **Bluba Anticipa reduce la fricción del registro cotidiano y convierte observaciones humanas confirmadas en evidencia longitudinal que permite detectar cambios respecto del patrón individual y activar apoyo preventivo.**
