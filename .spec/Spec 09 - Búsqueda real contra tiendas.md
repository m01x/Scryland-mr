# Spec 09 - Búsqueda real contra tiendas

**Estado:** Implementado
**Fecha:** 2026-08-22
**Tipo:** Orquestador (un solo bloque `@Agente-Backend`; orquestador afina `shared/`)

**Objetivo:** Primera spec donde el backend deja de ser andamiaje y hace lo que promete: consultar las tiendas reales (Ineko y Paytowin, ambas Shopify con `/search/suggest.json`), normalizar a prints, agrupar "un print = una card", y exponer `GET /api/search?q=` con el contrato ya definido en Spec 05.

## Alcance

### Involucra
- **Orquestador** — afina `shared/` (campo `url` en `StoreOffer`, ids canónicos de tienda), redacta esta spec, actualiza `State.md` y documenta en Notion al cierre.
- **@Agente-Backend** — toda la implementación dentro de `app/api` (adapters, normalización, servicio de búsqueda, controlador, DTO).
- **Humano** — aprueba, revisa y marca Implementado. Participa también en el gate de sondeo (ver bloque del worker).

### Contexto
El contrato ya existe desde Spec 05 (`StoreOffer`, `SearchResult`, `SearchResponse`) y la infraestructura de consulta desde Spec 07 (`StoreHttpService`, `CacheService` TTL en memoria, `StoresModule`, `HttpModule` con timeout 5s). El frontend sigue maquetado con `mockResults.ts` (Spec 10 lo conecta a `useQuery`); esta spec no toca `app/web`.

Verificación en vivo (hecha por el orquestador antes de redactar): `inekosingles.com` y `paytowin.cl` exponen el **mismo** shape Shopify en `/search/suggest.json`:

- `resources.results.products[]` con `title` (`"Sol Ring [Commander Masters]"`, o `"Sol Ring (0910) [Secret Lair Drop Series]"`), `handle`, `price` (**string entero CLP**, ej. `"4920"`), `price_min`/`price_max`, `available` (**boolean a nivel de producto**), `url` (con query de tracking `?_pos=…`), `featured_image.url`, `tags` (incluye `Foil`/`Normal`), `vendor`, `type` (`"MTG Single"`).
- `suggest.json` **fusiona foil/normal** en un solo producto (`variants` llega vacío); `price` es el precio de la variante más barata. Decisión de spec: **producto = print, precio mínimo** (la granularidad foil/normal se difiere).
- Excepciones sucias ya observadas: en Paytowin el producto `"Sol Ring [The List]"` tiene handle `sol-ring-mystery-booster` (title y handle discrepan). La normalización debe tolerar esto de forma general.

### Incluye
- **Orquestador (`shared/src/index.ts`, pre-despacho):** agregar `url?: string` a `StoreOffer`; documentar los ids canónicos de tienda `ineko` / `paytowin` / `catlotus` como convención del campo `store`.
- **Backend (`app/api`):**
  - Ampliar `src/stores/stores.constants.ts` con base URL + endpoint `/search/suggest.json` por tienda (Ineko, Paytowin; Catlotus sin URL real).
  - `src/search/` con módulo, servicio, controlador, DTO y adapters.
  - `InekoAdapter` / `PaytowinAdapter` que consumen `StoreHttpService`; `CatlotusAdapter` stub que retorna lista vacía.
  - Normalización a `printKey` = `tcg:${data-tcgid}` (extraído del `body`), con fallback a título normalizado; `set` desde el `body` (`<td>Set:</td>`), fallback al bracket del title.
  - `SearchService` con fan-out a ambas tiendas (más el stub), cache por query y tolerancia al fallo individual.
  - `GET /api/search?q=` con DTO validado.

### No incluye
- Frontend (`app/web`) — la migración del mock a `useQuery` es Spec 10.
- Catlotus real (sigue fuera del scraping por `robots.txt`; solo stub).
- Granularidad foil/normal (implica endpoints por producto, fase futura).
- Paginación, rate limiting, persistencia, colas, concurrencia (`p-limit`).
- Tests automatizados de unidad/E2E (el smoke test es manual vía `curl`).

## Plan de implementación
1. Orquestador escribe Spec 09 en Borrador y pide aprobación.
2. Aprobado → orquestador hace el pre-despacho de `shared/` (campo `url`, ids canónicos). No hay instalaciones ni cambios de deps, así que no hay fase serial de lockfile.
3. Orquestador despacha el bloque de tarea a `@Agente-Backend`.
4. **[GATE]** El worker ejecuta el sondeo de `title` crudos y reporta antes de escribir la normalización (ver bloque).
5. Consolidación (orquestador): `pnpm --filter @scryland/api build` + `lint`, y smoke test `curl "localhost:3000/api/search?q=Sol Ring"`.
6. Revisión humana y cierre: `State.md` + Notion.

## Criterios de aceptación globales
- [x] `GET /api/search?q=Sol%20Ring` devuelve un `SearchResponse` con resultados de Ineko y Paytowin agrupados por `printKey` (un print = una card).
- [x] Una tienda que falla no tumba la respuesta (la otra sigue devolviendo resultados).
- [x] La búsqueda cachea por query normalizada (una segunda llamada idéntica no re-consulta las tiendas).
- [x] `bestPrice` es el mínimo de las ofertas disponibles; si no hay ninguna disponible es `null` (nunca `0` ni `Infinity`).
- [x] `pnpm --filter @scryland/api build` y `pnpm --filter @scryland/api lint` pasan (exit 0).
- [ ] Humano revisa y da visto bueno.

## Decisiones
- **`/search/suggest.json` como única fuente por query:** un solo request por tienda da `title`, `price`, `available`, `handle` e `image` juntos. Evita N+1 contra `/products/{handle}.js`. El costo: foil/normal se fusiona y solo se ve el precio mínimo (asumido en v1).
- **`producto = print`, precio mínimo:** `price` es la variante más barata del producto. Coherente con "comparar dónde comprar la carta más barata". La distinción foil/normal queda diferida.
- **`printKey` = `tcgid` (cross-store):** el `data-tcgid` del `body` es el ID de TCGPlayer, catálogo externo y estable, idéntico para el mismo print en ambas tiendas (verificado: 4 variantes de Fallout coinciden). Se prefiere sobre el título (texto libre por tienda). Si falta, fallback al título normalizado (que conserva `variant`), con `Logger.warn` para detectar si una tienda deja de emitirlo.
- **`bestPrice: number | null` (null explícito cuando nada disponible):** decisión, no accidente. Evita el peor caso (`0` se vería como precio real en la UI). La promoción a `bestPrice?: number` (ausente) queda citada en Deuda diferida.
- **`url?: string` en `StoreOffer` (opcional en Spec 09):** el deep-link es promesa central y el backend siempre lo rellena (limpio, desde `handle`, sin query de tracking). Se deja opcional para **no romper** el build de `app/web` (el mock no tiene `url` y esta spec no toca frontend); Spec 10 lo promueve a requerido.
- **Ids canónicos `ineko` / `paytowin` / `catlotus`:** full-name, coherentes con `stores.constants.ts`. El mock actual usa `p2w`; Spec 10 reconcilia `storeLabel`.
- **`CatlotusAdapter` stub:** mantiene la estructura a tres tiendas para que la UI y la futura integración no tengan que reescribir el fan-out.
- **Tolerancia al fallo con `Promise.allSettled`:** una tienda caída no debe tumbar la comparación. Se loguea el fallo y se devuelven los resultados de las tiendas sanas.

## Deuda diferida
- `StoreOffer.url?: string` → `url: string` (requerido) — Spec 10.
- `StoreOffer.store: string` → `StoreId = 'ineko' | 'paytowin' | 'catlotus'` (union type en `shared/`) — Spec 10.
- `SearchResult.bestPrice: number | null` → `bestPrice?: number` (ausente en vez de `null`) — Spec 10.
- `price` es el mínimo entre variantes (`price === price_min`; `price_max` diverge): la UI debe rotular "desde $X" — Spec 10.
- Detalle de variantes (foil/normal con precio propio) vía `/products/<handle>.js` — spec futura.
- Traducción ES→EN vía Scryfall (los nombres en español de las tiendas no son la identidad) — spec futura.

## Riesgos
- **Fallback cuando falta `tcgid`:** si una tienda deja de emitir `data-tcgid`, se cae al printKey por título (que conserva `variant`); se loguea un `warn` con el `handle` para detectarlo. La divergencia de `title` entre tiendas solo afecta ese camino de fallback.
- **`price` string mal formado:** puede venir `""`, con separador de miles o con decimales en casos imprevistos. Mitigado: parseo defensivo (`parseInt`, fallback `null`).
- **`suggest.json` limita resultados (~10 por defecto):** para cartas con muchas ediciones no salen todas. Se usa `resources[limit]` (20) y se acepta en v1.
- **Timeout 5s por tienda:** si una tienda tarda más, `allSettled` la da por fallida y la respuesta sale con la otra. Aceptable para v1; el timeout ya está configurado en `HttpModule`.
- **Cambios futuros del shape Shopify:** el parseo se encapsula en los adapters para aislar el impacto.

---

# Tarea — @Agente-Backend

**Estado:** Aprobado

### Contexto
Tenés la infra de consulta de Spec 07 (`StoreHttpService` para el GET genérico, `CacheService` TTL, `StoresModule` con constantes de Ineko/Paytowin, `HttpModule` con timeout 5s). El contrato `SearchResult`/`StoreOffer`/`SearchResponse` vive en `@scryland/shared` y el orquestador ya agregó `url?: string` a `StoreOffer`. Tu trabajo es la primera integración real contra las tiendas.

### Incluye
- **Paso 0 — GATE de sondeo (bloqueante):** antes de escribir `normalize.ts`, hacer una llamada real a `/search/suggest.json?q=Sol Ring&resources[type]=product&resources[limit]=20` en **ambas** tiendas vía `StoreHttpService`, capturar los `title` crudos (sin parsear), y **reportarlos al orquestador** junto con el esquema de normalización propuesto. No avanzar a la normalización hasta recibir confirmación. Si los formatos no convergen (misma carta ⇒ distinta `printKey`), **detenerse**.
- Ampliar `src/stores/stores.constants.ts` con base URL y endpoint por tienda: Ineko `https://inekosingles.com`, Paytowin `https://paytowin.cl`, path `/search/suggest.json`.
- `src/search/` con:
  - `search.module.ts` (importa `StoresModule`), `search.controller.ts`, `search.service.ts`.
  - `dto/search-query.dto.ts`: `q` string, `@IsString` + `@IsNotEmpty` + `@MinLength(2)` + trim.
  - `adapters/shopify-suggest.types.ts`: tipado del shape crudo.
  - `adapters/store-adapter.interface.ts` y `adapters/ineko.adapter.ts` / `paytowin.adapter.ts` / `catlotus.adapter.ts` (stub → `[]`).
  - `normalize.ts`: `printKey` y parseo de `title`.
- Normalización: `printKey` = `tcg:${data-tcgid}` extraído del `body` (regex `data-tcgid="([^"]*)"`), fallback al título normalizado (`buildPrintKey` con `variant`); `set` = valor de `<td>Set:</td><td>…</td>` del `body`, fallback al bracket del title; `cardName`/`variant` desde el title; `editionLabel` = `variant ? \`${variant} · ${set}\` : set`.
- Precio: `price` string → `parseInt` → `number`; si no es parseable, `null`. `currency: "CLP"`. `available` = `product.available`.
- Deep-link: `url` = `${baseUrl}/products/${handle}` (limpio, sin la query de tracking).
- Agrupación: `printKey` → `SearchResult` con `offers` de cada tienda (una por tienda); `bestPrice` = mínimo de ofertas con `available` y `price` no-null; si no hay ninguna, `null`.
- `SearchService`: fan-out con `Promise.allSettled` sobre los tres adapters; cache por query normalizada vía `CacheService` (TTL 5 min); un fallo individual se loguea y no tumba la respuesta.
- `GET /api/search?q=` que devuelve `SearchResponse` (`query`, `results`, `totalEditions`).

### No incluye
- `shared/` (ya lo tocó el orquestador), `.spec/`, `e2e/`, archivos raíz.
- Frontend (`app/web`).
- Catlotus real, granularidad foil/normal, paginación, rate limiting.
- Instalar dependencias ni tocar `pnpm-lock.yaml`.

## Plan de implementación
1. Ejecutar el GATE de sondeo y reportar los `title` crudos + esquema propuesto. **Esperar confirmación.**
2. Ampliar `stores.constants.ts` con base URL + endpoint.
3. Crear el tipado crudo, los adapters y `normalize.ts`.
4. Implementar `SearchService` (allSettled + cache + agrupación + `bestPrice`).
5. Crear `SearchModule`, `SearchController` y el DTO.
6. Verificar `pnpm --filter @scryland/api build` y `pnpm --filter @scryland/api lint`.

## Criterios de aceptación
- [x] El sondeo reporta los `title` crudos de ambas tiendas y, si los formatos convergen, el esquema de normalización propuesto.
- [x] El sondeo incluye al menos un caso donde `title` y `handle` discrepan (ej. `"Sol Ring [The List]"` → `sol-ring-mystery-booster`) y la normalización lo maneja de forma **general**, sin hardcodear el nombre de la carta.
- [x] `GET /api/search?q=Sol%20Ring` devuelve resultados de Ineko y Paytowin agrupados por `printKey`.
- [x] Una tienda que falla no impide que la otra devuelva resultados.
- [x] La búsqueda cachea por query normalizada (segunda llamada idéntica no re-consulta).
- [x] `bestPrice` es el mínimo de ofertas disponibles; `null` si ninguna disponible (nunca `0` ni `Infinity`).
- [x] `url` se construye limpia desde `handle` (sin query de tracking).
- [x] `pnpm --filter @scryland/api build` y `pnpm --filter @scryland/api lint` pasan.
- [x] Smoke test: `q=Sol Ring Fallout` devuelve las 4 variantes como cards separadas (ids `tcg:539393`, `tcg:523077`, `tcg:539394`, `tcg:539392`).

## Notas / restricciones
- No tocar `shared/`, `.spec/`, `e2e/`, `pnpm-lock.yaml` ni instalar dependencias; si el contrato de `shared/` resulta insuficiente, detenerse y reportarlo.
- El gate de sondeo es bloqueante: no escribir `normalize.ts` ni despachar el resto hasta que el orquestador confirme la convergencia de `title`.
- La normalización debe ser general (por forma del título), nunca hardcodear nombres de cartas ni de sets.
