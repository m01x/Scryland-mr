# Spec 00 — Scaffold del backend

**Estado:** Implementado
**Fecha:** 2026-08-14

**Objetivo:** Montar un monorepo pnpm saludable con `app/api` (NestJS) funcional.

## Alcance

Incluye:
- Monorepo pnpm workspaces (`app/*`), un solo `pnpm-lock.yaml`.
- `app/api` NestJS arrancando y respondiendo.
- Archivos raíz: `package.json`, `pnpm-workspace.yaml`, `.nvmrc`, `.env.example`, `.gitignore`.

No incluye:
- `app/web` (frontend), `packages/shared`, `e2e/`.
- Integración con tiendas, specs de workers, agentes.

## Plan de implementación

1. Raíz: `package.json` (engines `node>=24`, `packageManager pnpm@10.33.0`, script `dev:api`), `pnpm-workspace.yaml` (`app/*`), `.nvmrc` (24), `.env.example` (`PORT=3000`), `.gitignore`.
2. Scaffold `app/api` con la CLI de Nest (`--skip-git --package-manager pnpm --strict`).
3. Renombrar paquete a `@scryland/api`.
4. `main.ts` lee `PORT` de `process.env`.
5. `pnpm install` en raíz → un solo lockfile (2 workspace projects).
6. Verificación: `GET /` → `200 "Hello World!"`.

## Criterios de aceptación

- [x] `pnpm install` genera un solo `pnpm-lock.yaml`.
- [x] `pnpm dev:api` levanta el servidor.
- [x] `GET http://localhost:3000/` responde `200 "Hello World!"`.
- [x] `PORT` configurable vía `.env`.

## Decisiones

- pnpm vía corepack, versión fijada en `packageManager`.
- Scaffold de Nest con su CLI (no fijar versiones a mano).
- Testing: archivos de test eliminados; dependencias se conservan para uso futuro.

## Riesgos

Ninguno relevante.
