# ADR-013 — Superficie web secundaria para demostración

- Status: Accepted
- Date: 2026-08-26

## Context

Bluba Anticipa mantiene una estrategia mobile-first y React Native + Expo como cliente principal del MVP. Al mismo tiempo, existe una interfaz React/Vite prototipada y NeuroHack 2026 requiere una demostración audiovisual clara, reproducible y acotada del flujo integrado para familia, profesor y especialista.

Completar los tres recorridos únicamente en el cliente mobile para la grabación agregaría trabajo de presentación que no incrementa el valor técnico del proof-of-concept. Backend y predictor ya están separados mediante contratos, por lo que una superficie secundaria puede demostrar la integración sin cambiar la arquitectura de producto. La Constitución del repositorio exige un ADR para autorizar esta excepción web.

## Decision

Se autoriza `apps/demo-web`, implementada con React, Vite y TypeScript, como cliente secundario exclusivo para demostración técnica, evaluación de integración y grabación del prototipo de NeuroHack 2026.

`apps/mobile` continúa siendo el cliente principal, la implementación objetivo para Android/iOS y el único cliente objetivo del MVP. La existencia de `apps/demo-web` no establece un compromiso de soporte web en producción ni convierte web en una segunda plataforma oficial.

## Scope

`apps/demo-web` puede incluir únicamente lo necesario para la demostración e integración:

- navegación visual de los roles familia, profesor y especialista;
- consulta y presentación de predicciones, confianza, factores y datos faltantes;
- creación de registros confirmados mediante la API vigente;
- un modo de presentación para video;
- herramientas locales y reversibles para ejecutar una demo reproducible.

La superficie es secundaria, no productiva y prescindible después de la hackathon. Retirarla no debe afectar `apps/mobile`, Backend, Predictor ni los contratos.

Quedan fuera de alcance un frontend web productivo, autenticación o despliegue web productivos, SEO, soporte de navegadores como requisito del MVP, duplicación integral del producto mobile y cualquier compromiso de soporte web futuro.

## Architectural constraints

- `apps/demo-web` debe consumir `services/api` a través de `packages/api-client` y de los tipos derivados de `contracts/openapi.yaml` cuando la operación ya esté representada allí.
- No puede definir una API paralela, contratos propios, payloads alternativos ni DTOs divergentes por conveniencia del cliente web.
- No puede acceder directamente a la base de datos ni a `services/predictor`, ni omitir la orquestación de Backend.
- No puede implementar o inferir scoring, thresholds, weights, ventanas, acumuladores, niveles de riesgo, confianza ni selección de factores predictivos.
- Se permiten adapters de presentación que traduzcan etiquetas, formatos o escalas visuales sin recalcular ni reinterpretar el dominio.
- Los fixtures sintéticos que determinen el escenario deben pertenecer a seed/tooling, Backend o tests; el frontend no puede ser fuente de verdad de riesgo ni contener un estado predictivo alternativo.
- Riesgo y confianza permanecen independientes. Missing no equivale a normal y `INSUFFICIENT_DATA` no puede presentarse como riesgo bajo.
- El score debe comunicarse como índice operativo de demostración, no como probabilidad calibrada. No se permiten claims clínicos no validados.
- Las recomendaciones deben conservar una fuente controlada; el predictor y el cliente web no inventan intervenciones.
- Los datos sintéticos deben identificarse explícitamente cuando el contrato los reporte.

Esta decisión no autoriza cambios en Predictor, nuevos modelos ML ni nuevos contratos. Una necesidad posterior de ese tipo debe seguir su proceso arquitectónico o contractual correspondiente.

## Consequences

- El vertical slice audiovisual puede implementarse y validarse en `apps/demo-web` sin alterar la dirección mobile-first del producto.
- La demo utiliza las mismas fronteras que el cliente mobile y prueba el flujo real API → FeatureBuilder → Predictor → RiskPrediction.
- El cliente web requiere validaciones propias de build, TypeScript y tests mientras permanezca en el monorepo.
- Las capacidades creadas solo para la superficie web no se consideran automáticamente requisitos del producto ni obligaciones de paridad con mobile.
- La superficie puede eliminarse después de NeuroHack 2026 sin migración de producto, siempre que no sea utilizada como fuente de verdad o dependencia de otros componentes.

## Alternatives considered

- Implementar primero los tres recorridos completos en mobile: rechazado para la grabación porque amplía el trabajo de presentación sin mejorar la prueba técnica de integración; mobile permanece como objetivo real del MVP.
- Convertir React/Vite en un cliente web productivo: rechazado porque contradice el alcance mobile-first y crearía una segunda plataforma que el MVP no necesita.
- Mostrar una demo web basada en mocks: rechazado porque no demuestra persistencia, orquestación ni recálculo del predictor real.
- Acceder desde la web directamente al predictor o a persistencia: rechazado porque viola las fronteras de Backend, Predictor y contratos.
- No conservar la superficie tras la hackathon: permitido; su carácter prescindible es parte de esta decisión.

## Relationship with ADR-002

Este ADR complementa `ADR-002 — Cliente mobile con React Native + Expo`. No lo reemplaza, no lo supersede y no modifica su decisión de producto: React Native + Expo continúa siendo el cliente principal y objetivo del MVP.

La única excepción introducida es una superficie web secundaria, acotada a demostración e integración para NeuroHack 2026. No autoriza un cliente web primario ni soporte web productivo.
