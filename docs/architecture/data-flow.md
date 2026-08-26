# Flujo de datos

## Registro estructurado

```text
Usuario -> Mobile -> DailyRecord contract -> API -> persistencia
                                             |
                                             v
                                      feature assembly
                                             |
                                             v
                                         predictor
                                             |
                                             v
                                        Prediction
                                             |
                                             v
                                           Mobile
```

## Texto/voz

```text
voz/texto
   |
   v
transcripción (si aplica)
   |
   v
extracción de variables
   |
   v
PREVIEW NO PERSISTIDO
   |
   v
confirmación/edición humana
   |
   v
DailyRecord
   |
   v
API
```

El componente generativo termina antes del motor predictivo.

## Predicción

1. API recupera historial pertinente.
2. Se construyen features directas y derivadas.
3. Predictor calcula estado de predicción.
4. Si la evidencia es insuficiente, `status=insufficient_data` y `risk=null`.
5. Si existe evidencia suficiente, se entrega `risk` junto a `confidence`, `data_quality`, factores y recomendaciones seleccionadas.
6. Mobile presenta el resultado según rol.

## Feedback

```text
predicción -> ventana temporal -> feedback del usuario
                               -> evento ocurrido/no ocurrido
                               -> estrategia aplicada
                               -> outcome
```

El feedback futuro puede alimentar evaluación, calibración y memoria de intervenciones, pero no se usa como afirmación de aprendizaje clínico automático en el MVP.
