# Spec 10 - Conexión del frontend con la búsqueda real

**Estado:** Implementado
**Fecha:** 2026-08-23
**Tipo:** Orquestador (un solo bloque `@Agente-Web`; orquestador afina `shared/` y `e2e/`)

**Objetivo:** Reemplazar el mock de la UI de búsqueda por consumo real de `GET /api/search`, y cerrar las deudas de contrato pendientes.

## Alcance

### Involucra
- **Orquestador** — afina `shared/` (pre-despacho: `url` requerido, `StoreId`), actualiza `e2e/` (test de Spec 07 contra datos reales, incluyendo arrancar el backend en `playwright.config.ts`), redacta esta spec, actualiza `State.md` y documenta en Notion al cierre.
- **@Agente-Web** — toda la implementación dentro de `app/web` (feature `search`: fetch + `useQuery`, estados, links, rotulado "desde", filtro de Disponibilidad real, eliminación del mock).
- **Humano** — aprueba, revisa y marca Implementado.

### Contexto
Spec 09 dejó el backend sirviendo `GET /api/search?q=` con `SearchResponse` (`query`, `results`, `totalEditions`) y el contrato ya definido en Spec 05 (`StoreOffer`, `SearchResult`). El frontend sigue maquetado con `app/web/src/feature/search/data/mockResults.ts` (4 ediciones de "Sol Ring" hardcodeadas, con ids de tienda `p2w` que no son canónicos). La infra del frontend ya está lista: `@tanstack/react-query` con `QueryClientProvider` en `main.tsx`, y Vite proxy de `/api` → `localhost:3000` (port del backend). Esta spec conecta ambos extremos y elimina el mock; el backend **no se toca**.

### Incluye
- **Orquestador (`shared/src/index.ts`, pre-despacho):**
  - `StoreOffer.url: string` (de `url?: string` — el backend ya lo rellena siempre, verificado en Spec 09).
  - `StoreOffer.store: StoreId`, con `export type StoreId = 'ineko' | 'paytowin' | 'catlotus'`.
  - `SearchResult.bestPrice: number | null` **sin cambios** (deuda "revisada y descartada", ver Decisiones).
- **Orquestador (`e2e/`, consolidación):**
  - `playwright.config.ts` arranca backend + frontend juntos (hoy solo levanta `web`).
  - `tests/search-usability.spec.ts` se reescribe para ejercer búsqueda real (adiós `'Sol Ring'`/`4`/`editions-count` hardcodeados).
- **Web (`app/web`):** ver bloque `@Agente-Web`.

### No incluye
- Backend (`app/api`) — no se toca.
- Detalle de variantes (foil/normal vía `/products/<handle>.js`).
- Búsqueda aproximada, multilingüe o traducción ES→EN.
- Catlotus real (sigue stub → lista vacía).

## Plan de implementación
1. Orquestador escribe Spec 10 en Borrador y pide aprobación.
2. Aprobado → orquestador hace el pre-despacho de `shared/` (`url` requerido, `StoreId`). No hay instalaciones ni cambios de deps → no hay fase serial de lockfile. Nota: tras este cambio, `app/web` **no compila** hasta que el worker elimine el mock (estado intermedio esperado, igual patrón que Spec 09).
3. Orquestador despacha el bloque de tarea a `@Agente-Web` (subagente `web`).
4. Consolidación (orquestador): actualiza `e2e/` (config + test), corre `pnpm build`, `pnpm lint` y `pnpm e2e`.
5. Revisión humana y cierre: `State.md` + Notion.

## Criterios de aceptación globales
- [x] Buscar "Purphoros" muestra el print con ofertas de ineko y paytowin, con precios distintos y links que abren el producto correcto.
- [x] Buscar "Sol Ring Fallout" muestra CUATRO cards separadas (no fusionadas).
- [x] Card en rojo cuando ninguna oferta está disponible.
- [x] Los tres estados (loading / error / vacío) son observables.
- [x] No queda ninguna referencia al mock en el código.
- [x] `pnpm build` y lint del monorepo en exit 0.
- [x] E2E de Spec 07 pasa contra datos reales.
- [x] Humano revisa y da visto bueno.

## Decisiones
- **`bestPrice: number | null` se mantiene (deuda revisada y descartada):** `null` y ausente son indistinguibles en pantalla, porque la card roja se decide con `offers.every(o => !o.available)` (no con `bestPrice`). Promover a `bestPrice?: number` no cambia ningún comportamiento observable; se cierra la deuda sin tocar el contrato.
- **`url: string` requerido en Spec 10:** el deep-link es promesa central; el backend ya lo rellena siempre. El mock actual no tiene `url`, pero como esta spec lo elimina, no hay conflicto (la rotura intermedia del build de `web` se acepta hasta completar el bloque).
- **`StoreId` como union type en `shared/`:** los ids canónicos (`ineko`/`paytowin`/`catlotus`) ya los fijó Spec 09; ahora se tipan de verdad en el contrato. El literal `p2w` del mock desaparece; `storeLabel` y la regla `accent` de `PrintCard` se reconcilian al id canónico `paytowin`.
- **`fetch` nativo, sin axios ni librerías nuevas:** el navegador ya trae `fetch`; no se suma dependencia. Coherente con "no instalar deps no contempladas".
- **`staleTime` alto (≈ 5 min):** el backend ya cachea por query (TTL 5 min en `CacheService`); el frontend no debe refetchear encima.
- **Query con mínimo 2 chars:** coherente con el `@MinLength(2)` del DTO del backend (`SearchQueryDto`).
- **Filtro "Disponibilidad" pasa a operar sobre datos reales:** desde Spec 05 era display-only (fijo en "Todas"). Ahora refleja la disponibilidad real de las ofertas. No se agrega un filtro por tienda nuevo.

## Deuda diferida
- Precio real por variante: `price` de `suggest.json` es `price_min` (la condición más barata, ej. Damaged, o idioma/foil), lo que hace que "desde $X" sea engañoso vs. el precio real del link. Leer condición/idioma/foil por variante vía `/products/<handle>.js` (ineko, HTTP 200) / `.json` (paytowin, HTTP 200) — **Spec 11**.
- Límite de ~10 productos por query de `suggest.json` (limitación conocida, documentada en Spec 09) — spec futura.

## Riesgos
- **Rotura intermedia del build de `web`:** tras el pre-despacho de `shared/`, `web` no compila hasta que el worker elimine el mock. Mitigado: estado transitorio dentro de la misma spec; el build se evalúa al final.
- **Shape real de la respuesta en la UI:** la primera vez que la UI ve datos reales pueden aparecer casos no contemplados por el mock (precio `null` con `available: true`, `editionLabel` con variantes, etc.). Mitigado: el contrato ya tipa estos casos; el worker los maneja con el `formatPrice` defensivo y la derivación de `isUnavailable`.
- **Dependencia del E2E del backend en vivo:** el test de Spec 07 pasa de "presentacional sin backend" a "contra datos reales". Mitigado: el orquestador arranca backend + frontend en `webServer` y adapta las aserciones; si las tiendas caen, el fan-out tolera fallos (Spec 09) pero el conteo de ofertas puede variar → aserciones tolerantes (≥1 resultado, presencia de ineko/paytowin).
- **`suggest.json` limita ~10 productos:** "Purphoros"/"Sol Ring Fallout" caen dentro del límite; aceptado en v1.

---

# Tarea — @Agente-Web

**Estado:** Implementado

### Contexto
El contrato vive en `@scryland/shared` y el orquestador ya lo afinó (`url` requerido, `store: StoreId`). Tenés `@tanstack/react-query` ya montado (`QueryClientProvider` en `main.tsx`) y el proxy de Vite `/api` → backend. Tu trabajo es conectar la feature `search` a `GET /api/search?q=`, agregar los estados que faltan, rotular precios y eliminar el mock — **sin tocar el backend**.

### Incluye
- `feature/search/data/`: función de fetch a `/api/search?q=` tipada con `SearchResponse` desde `@scryland/shared` (`import type`). `fetch` nativo, sin axios ni librerías nuevas. Reemplaza a `mockResults.ts` (que se elimina al final).
- `useQuery` con `queryKey: ['search', query]`, `enabled` solo con término válido (≥ 2 chars, coherente con el DTO), `staleTime` alto (≈ 5 min, el backend ya cachea).
- SearchBox deja de ser display-only y pasa a **input controlado** que alimenta la query (necesario para "buscar Purphoros"/"Sol Ring Fallout").
- Estados que hoy no existen: `loading`, `error` y `sin resultados` (results vacío).
- Precio rotulado **"desde $X"** (el `price` es el mínimo entre variantes del producto en Shopify, no un precio exacto).
- El filtro "Disponibilidad" (hoy fijo en "Todas") opera sobre datos reales: refleja la disponibilidad real de las ofertas y filtra resultados por disponibilidad.
- Deep-links: las filas de tienda disponibles enlazan a `offer.url` (target `_blank`, `rel="noopener noreferrer"`); el CTA "Ver mejor precio" enlaza al `url` de la oferta ganadora.
- Reconciliación del literal `p2w`: `storeLabel` y la regla `accent` de `PrintCard` pasan al id canónico `paytowin`.
- Eliminar `mockResults.ts` — **ÚLTIMO paso**, recién después de que la búsqueda real funcione end-to-end.

### No incluye
- `shared/` (ya lo tocó el orquestador), `.spec/`, `e2e/`, archivos raíz, `app/api/`.
- Instalar dependencias ni tocar `pnpm-lock.yaml`.
- Detalle de variantes, búsqueda aproximada, traducción.

## Plan de implementación
1. Crear la función de fetch tipada en `feature/search/data/`.
2. Conectar `useQuery` en la página (query como key, `enabled`, `staleTime`).
3. Hacer SearchBox un input controlado que alimenta la query.
4. Implementar los estados `loading` / `error` / vacío.
5. Rotular precios "desde $X"; reconciliar `p2w` → `paytowin`; cablear deep-links con `offer.url`; hacer funcional el filtro de Disponibilidad.
6. Verificar `pnpm --filter @scryland/web build` y `pnpm --filter @scryland/web lint`.
7. Eliminar `mockResults.ts` y verificar que no queda ninguna referencia al mock (`grep -ri "mockResults\|mock" src/feature/search`).

## Criterios de aceptación
- [x] Buscar "Purphoros" muestra el print con ofertas de ineko y paytowin, precios distintos y links que abren el producto correcto.
- [x] Buscar "Sol Ring Fallout" muestra CUATRO cards separadas.
- [x] Card en rojo cuando ninguna oferta disponible.
- [x] `loading` / `error` / vacío son observables.
- [x] El precio se muestra rotulado "desde $X".
- [x] El filtro de Disponibilidad refleja la disponibilidad real de las ofertas.
- [x] No queda referencia al mock (`mockResults.ts` eliminado, sin `p2w` ni datos hardcodeados).
- [x] `pnpm --filter @scryland/web build` y `lint` pasan.

## Notas / restricciones
- No tocar `shared/`, `.spec/`, `e2e/`, archivos raíz, `app/api/`.
- No instalar dependencias.
- Si el contrato de `shared/` resulta insuficiente, detenerse y reportarlo al orquestador.
- La eliminación del mock es el último paso; no borrarlo antes de validar la búsqueda real end-to-end.
