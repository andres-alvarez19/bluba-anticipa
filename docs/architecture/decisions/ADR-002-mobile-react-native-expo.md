# ADR-002 — Cliente mobile con React Native + Expo

- Status: Accepted
- Date: 2026-08-26

## Context

El producto requiere registro cotidiano de baja fricción, voz, notificaciones y uso desde teléfono.

## Decision

El cliente principal será React Native + Expo + TypeScript. No se implementará un frontend web como cliente primario del MVP.

## Consequences

Un solo código objetivo para Android/iOS y acceso directo a capacidades móviles. Toda UI se diseña phone-first.
