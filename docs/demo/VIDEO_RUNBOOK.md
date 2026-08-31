# Runbook de grabación — Demo final

Esta superficie web es una demo técnica secundaria. Usa datos sintéticos y un índice preventivo demostrativo; no representa un diagnóstico ni precisión clínica validada.

## Preparación inicial

Desde la raíz del repositorio:

```bash
make setup
make demo-check
```

La captura admite estos modos de Backend:

```bash
BLUBA_CAPTURE_MODE=demo
BLUBA_CAPTURE_DEMO_FALLBACK=false
```

`demo` es el modo recomendado para grabar: conserva el audio solo durante la solicitud y genera una transcripción determinística en Backend. El modo `provider` queda reservado para una integración futura; en este checkout solo continúa si el fallback fue habilitado explícitamente:

```bash
BLUBA_CAPTURE_MODE=provider
BLUBA_CAPTURE_DEMO_FALLBACK=true
```

No se requieren ni deben configurarse secretos `VITE_*`.

## Reset e inicio

Un solo comando migra, reinicia los datos sintéticos, levanta API y demo web:

```bash
BLUBA_CAPTURE_MODE=demo BLUBA_CAPTURE_DEMO_FALLBACK=false make demo
```

Abrir en Chrome o Edge reciente:

```text
http://localhost:5173/?demo=video
```

Autorizar el micrófono cuando el navegador lo solicite. Mantener la terminal fuera de la captura; no hace falta volver a ella durante el recorrido.

## Guion de clics

1. En `Familia`, mostrar el estado preventivo inicial y el indicador de datos de demostración.
2. Pulsar `Contarlo por voz`.
3. Pulsar el micrófono y decir:

   > Anoche Mateo durmió cinco horas y media, se despertó dos veces y hoy amaneció bastante irritable. Además nos avisaron que habrá un acto especial en el colegio con mucho ruido.

4. Detener la grabación. Esperar `Procesando audio` y luego revisar la transcripción y `Información detectada`.
5. Pulsar una variable, corregirla y guardar la edición para hacer visible la confirmación humana.
6. Pulsar `Confirmar y actualizar predicción`.
7. Mostrar `Registro confirmado` y `Actualizando estado preventivo…`; esperar el nuevo estado proveniente del Backend.
8. Cerrar el modal y enseñar factores, confianza y la comparación con el patrón habitual.
9. Abrir `Escribir observación`, analizar el texto precargado y mostrar brevemente el mismo tipo de borrador. Cerrar sin confirmar para explicar que un draft pendiente no alimenta el predictor.
10. Cambiar a `Profesor` y luego a `Especialista`. Ambos roles presentan la misma predicción actual, adaptada solo en la redacción.
11. Cerrar mostrando la acción preventiva de catálogo/historial ya controlada por el sistema.

El resultado estable esperado es un cambio semántico filmable desde el nivel inicial `MEDIUM` al nivel `HIGH`. No basar la narración en un score numérico exacto.

## Recuperación rápida

- Permiso denegado: habilitar micrófono desde el icono de permisos del navegador, cerrar el modal y reabrirlo.
- Navegador sin `MediaRecorder`: usar Chrome/Edge reciente o demostrar la vía `Escribir observación`.
- Audio vacío: reintentar y hablar antes de detener la grabación.
- Error de red: comprobar que API y Vite siguen ejecutándose; usar `Reintentar` en el modal.
- Estado alterado por un ensayo anterior: detener `make demo` con `Ctrl+C` y volver a ejecutar el comando de inicio. `make demo` siempre realiza el reset.
- Proveedor no disponible: para la grabación usar `BLUBA_CAPTURE_MODE=demo`; el fallback nunca vive en React ni calcula riesgo.

## Checklist pre-grabación

- [ ] `make demo-check` termina sin fallos.
- [ ] Docker está activo y PostgreSQL responde.
- [ ] `make demo` termina el reset y muestra la URL.
- [ ] La URL incluye `?demo=video` y abre inicialmente `Familia`.
- [ ] Chrome/Edge tiene permiso de micrófono para `localhost`.
- [ ] La predicción inicial es `MEDIUM`.
- [ ] Voz produce transcripción y variables reales desde Backend.
- [ ] Una edición queda visible antes de confirmar.
- [ ] Confirmar produce una predicción nueva `HIGH` sin refresco manual.
- [ ] Profesor y Especialista muestran la misma actualización.
- [ ] No hay terminales, DevTools, claves ni datos identificables en cuadro.

## Arquitectura para preguntas del jurado

```text
voz o texto
→ transcripción/extracción conservadora en Backend
→ ObservationDraft pendiente
→ revisión y confirmación humana
→ DailyRecord longitudinal
→ FeatureBuilder + predictor independiente
→ riesgo, confianza y factores compartidos
```

Los campos no mencionados permanecen ausentes; no se convierten en valores normales. El componente NLP estructura la observación, pero nunca calcula el riesgo.
