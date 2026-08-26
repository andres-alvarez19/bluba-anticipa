# ADR-010 — PostgreSQL + SQLAlchemy para persistencia del MVP

- Status: Accepted
- Date: 2026-08-26

## Context

BOOTSTRAP-01 usa un store global en memoria, suficiente para comprobar imports y tests mínimos pero no para el skeleton técnico integrado. Stage B necesita persistencia real y una frontera estable entre dominio y almacenamiento sin introducir infraestructura excesiva.

## Decision

Usar:

- PostgreSQL como base de datos del MVP.
- SQLAlchemy 2.x como ORM/capa de acceso.
- `psycopg` como driver PostgreSQL.
- Alembic para migraciones.
- Una capa repository dentro de `services/api` para desacoplar rutas/servicios de SQLAlchemy.
- Docker Compose para levantar PostgreSQL localmente.

Para la hackatón se prefiere acceso síncrono simple; no introducir async DB, colas o event sourcing salvo necesidad concreta y nuevo ADR.

## Consequences

- El store en memoria solo puede mantenerse como test double/fixture.
- Los tests de integración deben poder ejecutarse contra una base efímera o configuración de test explícita.
- Las entidades persistidas conservan timestamps, IDs e idempotency keys necesarios por los contratos.
- La lógica predictiva sigue fuera de la capa de persistencia.
