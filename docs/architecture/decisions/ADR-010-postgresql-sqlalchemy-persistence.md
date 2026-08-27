# ADR-010 — PostgreSQL + SQLAlchemy para persistencia del MVP

- Status: Accepted
- Date: 2026-08-26

## Context

El skeleton inicial podía usar persistencia mínima, pero Stage B/C necesitan un flujo reproducible con historial longitudinal, migraciones y consultas temporales. El store en memoria no es suficiente como mecanismo productivo del MVP.

## Decision

Usar:

- PostgreSQL como base de datos del MVP integrado.
- SQLAlchemy 2.x como capa de acceso.
- `psycopg` como driver PostgreSQL.
- Alembic para migraciones.
- Una capa repository dentro de `services/api` para desacoplar rutas/servicios de SQLAlchemy.
- Docker Compose para levantar PostgreSQL localmente.

Para la hackatón se prefiere acceso síncrono simple. No introducir async DB, colas o event sourcing salvo necesidad concreta y nuevo ADR.

## Consequences

- SQLite in-memory queda permitido para tests rápidos.
- PostgreSQL es el camino de demo/CI con migraciones.
- La lógica predictiva sigue fuera de persistencia.
- Las consultas temporales deben comparar instantes reales, no strings ISO lexicográficos.
