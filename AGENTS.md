# AGENTS.md

## Qué es Scryland

Scryland es un portal comparador de precios de cartas de Magic: The Gathering entre tiendas online chilenas, inspirado en el modelo de Solotodo. El usuario busca una carta (por nombre o print/edición) y Scryland muestra en qué tiendas está disponible y a qué precio, con un link directo al producto en la tienda real para completar la compra ahí.

**Tiendas objetivo (v1):** Ineko y Paytowin (Shopify). Catlotus queda fuera del scraping automatizado (robots.txt en `cartas.catlotus.cl`).

## Principios de diseño

- **Respeto a las tiendas fuente**: sin scraping agresivo, robots.txt se respeta siempre, cache para minimizar carga repetida.
- **Un print, una card**: cada print (nombre + set + variante) es una entidad propia; no se agrupan ediciones bajo un solo precio.
- **Deep-linking, no checkout propio**: Scryland no vende ni gestiona carritos; lleva al producto exacto en la tienda real.

## Stack

- Monorepo único con **pnpm workspaces** (`app/*`, `shared`), un solo `.git` en la raíz.
- **Node**: LTS (v24), declarado en `engines` y en `.nvmrc`.
- **pnpm**: versión fijada en `packageManager`, activada vía `corepack`.
- **Backend**: NestJS en `app/api` (`@scryland/api`).
- **Frontend** (futuro): React + TanStack en `app/web`.
- **Contratos** (futuro): `shared/` (`@scryland/shared`) — tipos/DTOs puros, fuente de verdad del contrato entre frontend y backend.
- **Scope de paquetes**: `@scryland/*`.

## Patrón de trabajo: orquestador-trabajador + Spec-Driven Design (SDD)

- **Orquestador** — la sesión principal, en la raíz del repo. Define specs, mantiene `shared/` y `.spec/`, y reparte specs derivadas a los workers.
- **Workers aislados** — `app/web` (React + TanStack) y `app/api` (NestJS). Cada uno con su propio `AGENTS.md` local; escriben únicamente dentro de su carpeta. `shared/` es de solo lectura: si necesitan cambiar el contrato, se detienen y lo reportan al orquestador.
- **`shared/`** — interfaces puras (sin decoradores de Nest). Si un lado usa un campo que no existe ahí, no compila.
- **`.spec/`** — carpeta única con `State.md` y cada spec numerada. Solo el orquestador escribe aquí.
- **`.spec/Notion-format.md`** — Instrucciones de como actualizar notion para seguir un formato uniforme. Solo el orquestador escribe aquí.
- **`.spec/Simple-Spec-format.md`** y **`.spec/Orchestrator-Spec-format.md`** — Formatos de spec (Simple y Orquestador). Solo el orquestador escribe aquí.

**Regla dura:** frontend nunca toca código de backend y viceversa — solo lectura para observar, nunca escritura.

## Flujo de specs

Cuatro estados, dos de ellos finales. Ninguna spec nueva se abre si la anterior no está en un estado final. Los estados se reconocen tanto en español como en inglés:

| Estado | Significado | Quién lo marca |
|--------|-------------|----------------|
| Borrador (Draft) | Requerimiento redactado, no autorizado | Orquestador |
| Aprobado (Approved) | Borradores listos y revisados; recién aquí se escribe código | Flavio, manualmente |
| Implementado (Implemented) — final | Código hecho, revisado y aceptado | Flavio, tras revisión |
| Obsoleto (Obsolete) — final | Descartado o pausado indefinidamente | Flavio |

**Reglas**

- Antes de crear una spec nueva, la anterior debe estar en **Implementado** u **Obsoleto**.
- Solo se implementan specs en estado **Aprobado**; la aprobación es manual y humana. Ningún agente se autoaprueba.
- `State.md` lo escribe únicamente el orquestador. Los workers reportan que terminaron; el orquestador registra.
- Entre Aprobado e Implementado se distingue con un flag de *listo para revisión* en `State.md` (no se agrega un quinto estado).
- A Notion solo entran specs en estado final.

## Convenciones del repo

- **Node**: LTS (v24) en `engines` y `.nvmrc`.
- **pnpm**: versión exacta en `packageManager`, activada vía `corepack`.
- **Nest y React**: lo que instale su CLI al momento del scaffold. No se fijan versiones a mano.
- **Puertos**: los por defecto de cada framework, declarados en `.env.example`.
- **Scripts en la raíz**:
  - `dev:api` — levanta solo el backend.
  - `dev:web` — levanta solo el frontend (futuro).
  - `dev` — levanta ambos (futuro).
- **Variables de entorno**: viven en `.env.example`, no en documentos.

## Estado actual

- Monorepo pnpm montado (`app/*`, `shared`), un solo `pnpm-lock.yaml`.
- `app/api` NestJS funcional (`@scryland/api`): `GET /` responde `200 "Hello World!"`.
- `.spec/` con `Spec 00 - Scaffold del backend` (Implementado), `Spec 01 - Consolidación Shared y Convención de Specs` (Borrador) y `State.md`.
- Pendiente: `app/web`, contrato de `shared/`, `e2e/`.
- Testing: archivos de test eliminados por ahora; dependencias de testing instaladas para uso futuro.
