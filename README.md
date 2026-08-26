# Bluba Anticipa

Bluba Anticipa es un sistema mobile-first de apoyo preventivo que analiza longitudinalmente registros cotidianos para identificar señales tempranas de riesgo de desregulación, estimar la confianza de la predicción y explicar los factores relevantes.

## Arquitectura objetivo

- **Mobile:** React Native + Expo + TypeScript.
- **API:** FastAPI + Python.
- **Predictor:** Python, separado de la API por un contrato explícito.
- **Datos:** PostgreSQL para el MVP integrado.
- **Fuente de verdad de integración:** `contracts/`.

## Harness de agentes

El repositorio está diseñado para trabajo paralelo de agentes. Leer `AGENTS.md` antes de modificar código. Los roles viven en `.agents/roles/`, los workflows en `.agents/workflows/` y el contexto común en `.agents/context/`.

## Estado

La etapa A define arquitectura, contratos, roles, workflows y ADRs. El scaffold ejecutable de mobile/API/predictor se implementa en la siguiente etapa del bootstrap.
