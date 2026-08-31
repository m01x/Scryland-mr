# Spec 11 - Precio real por variante y modal de detalle

**Estado:** Implementada
**Fecha:** 2026-08-27
**Tipo:** Orquestador (bloques `@Agente-Web` y `@Agente-Backend`; orquestador afina `shared/`, raíz y `e2e/`)

**Objetivo:** Cerrar la deuda de `price_min` heredada de Spec 09/10. La card de resultado mantiene el rótulo "desde $X" por tienda, pero el detalle real de variantes (condición / idioma / foil / precio exacto / disponibilidad) se carga **bajo demanda**, al abrir un modal de una tienda concreta, sin multiplicar el fan-out de requests salientes.

## Alcance

### Involucra
- **Orquestador** — pre-despacho de `shared/` (contrato) y del `package.json` raíz; redacta esta spec; consolidación de `e2e/` y verificación final de build/lint/e2e; actualiza `State.md` y documenta en Notion al cierre.
- **@Agente-Backend** — endpoint nuevo `GET /api/offers/:store/:handle`, adapter de detalle sobre `/products/<handle>.js`, parseo de SKU, `User-Agent`/timeout en `StoreHttpService`, cache por `handle`.
- **@Agente-Web** — debounce del `SearchBox` (paso 1), filas por `StoreId` canónico, modal por tienda, `useQuery` de detalle.
- **Humano** — aprueba, revisa y marca Implementado.

### Contexto
Spec 09/10 dejaron la card mostrando `price_min` (el mínimo sobre **todas** las variantes, agotadas incluidas) rotulado "desde $X". En un catálogo de singles donde lo barato es lo que ya se vendió, el sesgo es sistemático y siempre hacia abajo. Sondeos reales del 27-08-2026 lo confirmaron:

- **Ineko — `Nylea, Keen-Eyed [Theros Beyond Death]`**: producto `available: true`, `price_min: 5380` ($5.380). De 10 variantes, solo Near Mint tiene stock, a $7.690. Error 1,4x.
- **Paytowin — `Bow of Nylea [Theros]`**: producto `available: true`, `price_min: 2800` ($2.800). De 30 variantes, solo Near Mint Foil Spanish tiene stock, a $12.400. Error 4,4x.

Ambas tiendas corren **BinderPOS** sobre Shopify: el shape del detalle es idéntico entre tiendas. Dos aprendizajes técnicos que esta spec documenta como contrato:

1. **Escala de precios difiere por ENDPOINT, no por tienda.** `/search/suggest.json` entrega CLP entero (`5380` = $5.380); `/products/<handle>.js` entrega **centavos** (`538000` = $5.380). El adapter de detalle **divide por 100 incondicionalmente** (no copiar la heurística frágil del theme de ineko `if (price > 10000) price = price / 100`).
2. **El SKU es la fuente de verdad** de condición/idioma/foil, no el `option1`. Los títulos no son consistentes entre tiendas (ineko omite el idioma inglés; paytowin lo explicita cuando no lo es). El SKU siempre lo trae.

La estructura de variantes en `/products/<handle>.js`:

- `options: ["Title"]` — una sola opción en ambas tiendas.
- `option1` es el título concatenado (`"Near Mint"`, `"Damaged Foil"`, `"Near Mint Foil Spanish"`); no hay `option2`/`option3`.
- `available` viene **por variante** y es la fuente de verdad de stock (no se usa `inventory_quantity`, que el theme inyecta en el HTML, no en el `.js`).
- Formato de SKU observado: `<SET>-<NUM>-<LANG>-<FINISH>-<COND>` (ej. `THB-185-EN-NF-1`, `THS-153-ES-FO-1`). Mapeo de condición: `1` Near Mint, `2` Lightly Played, `3` Moderately Played, `4` Heavily Played, `5` Damaged. `FINISH`: `NF` normal, `FO` foil. `LANG` observados: `EN`, `ES`, `JP`.

Volumen de variantes: ~10 en ineko, hasta 30 en paytowin (3 idiomas × 2 acabados × 5 condiciones).

### Incluye
- **Orquestador — `shared/src/index.ts` (pre-despacho):**
  - `StoreOffer.handle: string` — identificador para pedir el detalle. **No derivar del `url`** (fragilidad ante cambios de formato).
  - `StoreOffer.imageUrl?: string` — desde `featured_image` (ya tipado en `shopify-suggest.types.ts` y presente en `suggest.json`; cero requests extra).
  - `CardCondition` — union tipada de las 5 condiciones (conjunto cerrado verificado).
  - `CardFinish = 'normal' | 'foil'` — union tipada (conjunto cerrado).
  - `OfferVariant` — `condition: CardCondition | null`, `language: string | null`, `finish: CardFinish | null`, `price: number | null` (CLP, ya dividido por 100), `available: boolean`, `url: string` (deep-link a la variante `?variant=<id>`).
  - `OfferDetailResponse` — `store: StoreId`, `handle: string`, `imageUrl?: string`, `productUrl: string`, `variants: OfferVariant[]`.
- **Orquestador — `package.json` raíz (pre-despacho):** `dev` pasa a `pnpm build:shared && concurrently …` (ver Decisiones, "build:shared en dev").
- **Backend (`app/api`):** ver bloque `@Agente-Backend`.
- **Web (`app/web`):** ver bloque `@Agente-Web`.
- **Orquestador — `e2e/` (consolidación):** ver Plan de implementación paso 4.

### No incluye
- Cambiar la forma de `/api/search` ni la semántica de `SearchResponse`/`SearchResult` (4.2): `StoreOffer` solo gana dos campos.
- Que el backend emita **ofertas sintéticas** para tiendas que no devolvieron el print (4.4): las filas faltantes las fabrica el frontend.
- Grayscale en la card (4.6, descartado).
- Catlotus real (sigue stub → lista vacía; su fila es "Próximamente").
- Inventario numérico (`inventory_quantity`) — solo `available` (3.5).
- Búsqueda aproximada, multilingüe o traducción ES→EN; agrupar prints.

## Plan de implementación
1. Orquestador escribe Spec 11 en Borrador y pide aprobación.
2. Aprobado → orquestador hace el pre-despacho de `shared/` (campos + tipos nuevos) y del `package.json` raíz (`dev`). No hay instalaciones ni cambios de deps → no hay fase serial de lockfile. **Rotura intermedia esperada:** tras hacer `handle` requerido, `app/api` no compila hasta que el backend lo emita (el frontend solo consume `StoreOffer`, no se rompe). En esta ventana `pnpm build` (y por tanto `pnpm dev`) se espera **rojo**; no es fallo de ningún worker.
3. Orquestador despacha en **paralelo** los bloques a `@Agente-Web` y `@Agente-Backend` (una respuesta, una llamada `task` por subagente). El debounce del web es el paso 1: es la mitigación del riesgo que esta misma spec introduce.
4. Consolidación (orquestador): actualiza `e2e/` (test de modal, test de conteo con tecleo real, aserción de filas bloqueadas, ajuste de timing de Spec 07/10), y corre `pnpm build`, `pnpm lint` y `pnpm e2e`. Recién aquí `app/api` vuelve a compilar en el build del monorepo y se verifica el verde final.
5. Revisión humana y cierre: `State.md` (bajar la deuda de `price_min`) + Notion.

## Criterios de aceptación globales
- [ ] Buscar **"Nylea, Keen-Eyed"** y abrir el modal desde una fila con stock muestra variantes con precio real y condición; al menos una variante disponible exhibe un precio distinto del "desde $X" de la card (no `price_min`).
- [ ] El modal muestra la imagen del print clickeado, su nombre y su edición (descripción); en desktop se presenta en dos columnas (imagen a la izquierda, descripción + variantes a la derecha, scroll interno) y en mobile apilado. Si el proveedor no entrega variantes útiles, muestra el aviso "No se recibieron detalles desde el proveedor" (manteniendo el deep-link "Ver en tienda").
- [ ] Con una tienda caída, la otra sigue mostrando resultado en la card y su modal abre (lista variantes o degrada a imagen + enlace). Cubierto por el fan-out tolerante (`Promise.allSettled`, Spec 09) y aserciones E2E tolerantes.
- [ ] Un tecleo real de 8 caracteres — `pressSequentially('sol ring', { delay: 50 })` ≈ 400ms — resuelve **una sola** request a `/api/search`, contada interceptando la ruta (`page.route()` o `page.on('request')`). Prohibido verificarlo con `fill()` (inyecta el valor en un único evento y no ejercita el debounce).
- [ ] Los tres estados de fila son observables: "desde $X" (con stock, abre modal), "Sin stock en `<tienda>`" (bloqueada), "Próximamente" (bloqueada).
- [ ] Click en "Sin stock en `<tienda>`" no abre modal ni dispara request a `/api/offers`.
- [ ] Click en "Próximamente" no abre modal ni dispara request a `/api/offers`.
- [ ] `pnpm dev` arranca en limpio tras `git clone` sin build manual previo de `shared/` — **verificado en consolidación**, cuando `app/api` ya volvió a compilar (no se espera verde a mitad del despacho).
- [ ] `pnpm build`, `pnpm lint` y `pnpm e2e` los tres en exit 0 (consolidación).
- [ ] Humano revisa y da visto bueno.

## Decisiones
- **Modal por tienda, no por print (4.1):** 1 request por apertura en vez de ~20 por búsqueda completada; sin redundancia con las filas ya visibles; la imagen es la de esa tienda (se resuelve el problema de elegir entre N fotos). Costo aceptado: el deep-link pasa de un click a dos, a cambio de ver la condición antes de salir del sitio.
- **`/api/search` no cambia de forma (4.2):** `SearchResponse`, `SearchResult` y la semántica de `StoreOffer` se mantienen; `StoreOffer` solo gana `handle` e `imageUrl`.
- **`OfferVariant` no cuelga de `StoreOffer` (4.3):** `StoreOffer` sigue siendo 1:1 con la tienda y conserva el "desde $X". `OfferVariant` y `OfferDetailResponse` son tipos nuevos e independientes, devueltos solo por `GET /api/offers/:store/:handle`.
- **Filas faltantes se derivan en el frontend (4.4):** ausencia (tienda no devolvió el print) y sin-stock (devolvió con `available: false`) son estados distintos. La UI recorre la lista canónica de `StoreId` y fabrica la fila que falta; el backend no emite ofertas sintéticas. Catlotus (stub → lista vacía) cae en este caso.
- **Estados de fila (4.5):** con oferta y stock → "`<tienda>`: desde $X" (abre modal); con oferta sin stock → "Sin stock en `<tienda>`" (bloqueada); sin oferta → "Próximamente" (bloqueada).
- **Grayscale descartado (4.6):** si ninguna tienda tiene el print la card no aparece; y en touch no hay hover.
- **Degradación limpia (4.7):** si la tienda no entrega variantes útiles, el modal muestra imagen + enlace directo. No es error, es estado válido.
- **Adapter base compartido (4.8):** mismo shape en ambas tiendas; se replica el patrón `ShopifySuggestAdapter` (base abstracta + subclase por tienda que aporta `baseUrl` e id). La normalización ocurre en el backend, nunca en el cliente.
- **Debounce como paso 1 (4.9):** el debounce del `SearchBox` es la mitigación del riesgo que esta spec introduce; se cierra antes de que el backend multiplique requests salientes.
- **Escala de precios por endpoint (3.1):** `suggest.json` = CLP entero; `/products/<handle>.js` = centavos. Se divide por 100 **solo en el adapter de detalle**; **no se toca `parsePrice` de `normalize.ts`** (compartir el parser reintroduce el bug de escala). `parsePrice` sigue siendo para `suggest.json`.
- **SKU es la fuente de verdad (3.3):** los títulos no son consistentes entre tiendas; el SKU (`<SET>-<NUM>-<LANG>-<FINISH>-<COND>`) siempre trae condición/idioma/foil. Fallback: si el SKU no matchea el patrón, parsear `option1` y dejar en `null` lo no derivable. Nunca romper.
- **Presentación de variantes (6.1):** solo disponibles por defecto + toggle "Ver todas (N)" (agotadas atenuadas); orden por precio ascendente; el idioma se muestra como campo por fila, sin agrupar en v1 (a 30 filas con toggle basta).
- **La fila no se actualiza tras el modal (6.2):** sigue mostrando "desde $X" (`price_min`). El modal es la fuente del precio real; actualizar introduciría inconsistencia visual entre filas visitadas y no visitadas, y una segunda fuente de verdad efímera.
- **Tipos de `OfferVariant` (6.3):** `condition` y `finish` son unions tipadas (conjuntos cerrados verificados). `language` es `string | null` (string libre): el idioma de impresión de MTG es un conjunto abierto (PT/DE/FR/IT…) y una union obligaría a bajar a `null` un código que el SKU extrajo bien, corrompiendo la semántica de `null` ("no derivable") — el mismo bug de escala de `price_min` en otra forma. El código de 2 chars ya es normalizado y agnóstico de tienda, y la UI lo muestra tal cual. `null` = no derivable.
- **Card usa imagen real:** el arte usa `imageUrl` de la oferta ganadora, con fallback al placeholder; el modal usa la imagen de la tienda abierta.
- **`User-Agent` y timeout en `StoreHttpService`:** se añade `User-Agent` propio y un `timeout` explícito por llamada (el `HttpModule` ya registra `timeout: 5000` global; se reafirma por llamada para autodocumentar las llamadas a tiendas). Sin cambio en `.env.example`.
- **`build:shared` en `dev`:** `shared/package.json` apunta a `./dist/index.d.ts` y `dist/` está en `.gitignore`. En una máquina con un `dist` viejo, `pnpm dev` falla con `TS2305` tras cualquier cambio de contrato. `dev` pasa a `pnpm build:shared && concurrently …` para arrancar en limpio tras `git clone`.

## Riesgos
- **`/products/<handle>.js` no es API pública documentada:** el shape puede cambiar sin aviso. Mitigación: parseo defensivo, fallback a `option1` y degradación a solo-enlace; nunca romper.
- **El modal introduce un segundo par de estados loading/error.** Mitigación: reutilizar el patrón de `ResultsStates` (`role=status`/`alert` + `data-testid`) y `useQuery` con `enabled` solo al abrir.
- **El debounce cambia el timing de los E2E existentes.** Mitigación: los tests con `fill()` (Purphoros / Sol Ring Fallout) disparan una sola vez tras 300ms, absorbido por sus timeouts de 30s; el orquestador agrega el test de conteo con tecleo real.
- **Volumen asimétrico de variantes (10 vs 30).** Mitigación: toggle "Ver todas" + orden por precio; el default muestra solo disponibles.
- **`price_min` sigue visible en la card si el usuario no abre el modal.** Mitigación: aceptado; el rótulo "desde" señala que es un mínimo publicitado y el modal revela la realidad.
- **Rotura intermedia del build de `app/api`:** tras el pre-despacho, `handle` requerido deja `app/api` sin compilar hasta el cierre del bloque backend. Mitigación: estado transitorio dentro de la spec (mismo patrón que Spec 09/10); `pnpm build` se espera rojo en esa ventana y el verde final se verifica solo en consolidación.
- **404 de `catlotus`:** el frontend nunca debería pedir detalle de catlotus (fila "Próximamente" bloqueada). Si aparece un 404 de catlotus en logs, es síntoma de un bug en la derivación de filas del **frontend**, no del backend.

---

# Tarea — @Agente-Web

**Estado:** Aprobado

### Contexto
El contrato vive en `@scryland/shared` y el orquestador ya lo afinó (`StoreOffer.handle` + `imageUrl`, y los tipos `OfferVariant`/`OfferDetailResponse`). Tenés `@tanstack/react-query` montado (`QueryClientProvider` en `main.tsx`) y el proxy de Vite `/api` → backend. Tu trabajo: debounce del input (paso 1), una fila por cada `StoreId` canónico, el modal por tienda y su `useQuery` — **sin tocar el backend**.

### Incluye
- **Paso 1 (debounce, antes que todo lo demás):** hook `useDebouncedValue(value, delayMs)` (en `src/hooks/`). `SearchPage` alimenta el `useQuery` con el valor debounceado (~300ms); el input sigue atado al estado inmediato. `enabled`/estados se basan en el valor debounceado.
- **Card (`PrintCard`):** una fila por cada `StoreId` canónico (derivar de `STORE_LABELS`), no solo de `result.offers`. Arte con `imageUrl` de la oferta ganadora (fallback al placeholder). Estados de fila: con stock → "desde $X" y **abre modal**; sin stock → "Sin stock en `<tienda>`" bloqueada; sin oferta (catlotus) → "Próximamente" bloqueada.
- **`StoreRow`:** la fila con stock pasa de `<a>` a botón que abre el modal (el deep-link baja al modal). Las filas bloqueadas se renderizan **sin handler** (`<div>`/`<span>`, sin `onClick` ni `<button>`) — no basta con cambiar el estilo dejando el handler activo.
- **Modal por tienda (nuevo `OfferModal` + `components/ui/dialog.tsx`):** la adición de `dialog.tsx` vía shadcn es una **adición explícita autorizada** por esta spec (regla del AGENTS.md web sobre `ui/`). Contenido: imagen del print, **descripción del print** (nombre + edición) y listado de variantes (solo disponibles por defecto + toggle "Ver todas (N)", agotadas atenuadas, orden por precio ascendente, idioma como campo por fila), cada variante enlaza a su `url` (`target="_blank"`, `rel="noopener noreferrer"`). Sin variantes → mensaje "No se recibieron detalles desde el proveedor" + enlace directo a `productUrl`.
- **Estructura del modal (feedback de revisión, 31-08-2026):** el modal debe mostrar **la carta y la descripción del print seleccionado**. En desktop (`sm+`) dos columnas: imagen a la izquierda (fija), a la derecha descripción + listado de variantes con **scroll interno** (la columna derecha o la lista scrollea; el modal no desborda, alto topeado ~80svh). En mobile (`<sm`) apilado como en la versión anterior. `DialogContent` se ensancha en desktop (`max-w-2xl` o mayor). La imagen usa la del print que ya muestra la card (`bestOffer.imageUrl`) como primaria, con fallback a `data.imageUrl` del detalle y luego al placeholder. Los datos de descripción (`cardName`, `editionLabel`) e imagen vienen de `PrintCard` (props), **sin cambio de contrato en `shared/`**.
- **`useQuery` de detalle:** `GET /api/offers/:store/:handle`, `queryKey: ['offer', store, handle]`, `enabled` solo con el modal abierto, `staleTime` alta. Estados `loading`/`error` con `role=status`/`alert` + `data-testid`.

### No incluye
- `shared/`, `.spec/`, `e2e/`, archivos raíz, `app/api/`.
- Instalar dependencias (el `dialog` de shadcn es una adición local vía CLI sobre `radix-ui`, ya presente).
- Actualizar el precio de la fila tras cerrar el modal (6.2: se mantiene "desde $X").
- Definir tipos que dupliquen `shared/`.

## Plan de implementación
1. Crear `useDebouncedValue` y cablearlo en `SearchPage` (paso 1, antes que el modal).
2. Derivar una fila por cada `StoreId` en `PrintCard`; arte con `imageUrl` de la oferta ganadora.
3. Refactorizar `StoreRow`: fila con stock → botón que abre el modal; filas bloqueadas sin handler.
4. Agregar `components/ui/dialog.tsx` (shadcn) y construir `OfferModal` con listado de variantes + toggle + estados.
5. Agregar el `useQuery` de detalle (`enabled` solo con modal abierto).
6. Verificar `pnpm --filter @scryland/web build` y `pnpm --filter @scryland/web lint`.

## Criterios de aceptación
- [x] Un tecleo real de 8 caracteres dispara **una sola** búsqueda (debounce ~300ms); el input sigue responsivo.
- [x] Una card muestra una fila por cada `StoreId` (ineko / paytowin / catlotus) con los tres estados observables.
- [x] Click en fila con stock abre el modal de esa tienda; lista variantes disponibles con precio real y condición, o degrada a imagen + enlace.
- [x] Click en "Sin stock en `<tienda>`" no abre modal ni dispara request a `/api/offers`.
- [x] Click en "Próximamente" no abre modal ni dispara request a `/api/offers`.
- [x] Modal muestra estados `loading`/`error` observables.
- [x] Arte de la card usa la imagen de la oferta ganadora (fallback al placeholder).
- [x] `pnpm --filter @scryland/web build` y `lint` pasan.
- [ ] El modal muestra la imagen del print clickeado (primaria: imagen de la card, fallback `data.imageUrl`, fallback placeholder), el nombre de la carta y su edición.
- [ ] Desktop (`sm+`): imagen a la izquierda fija, descripción + variantes a la derecha con scroll interno; el modal no desborda (alto topeado). Mobile (`<sm`): apilado.
- [ ] Sin variantes → mensaje "No se recibieron detalles desde el proveedor" + deep-link "Ver en tienda" (sin romper `offer-variants` ni los estados de degradación).
- [ ] `pnpm --filter @scryland/web build` y `lint` pasan (re-verificado tras la revisión).

## Notas / restricciones
- Solo `app/web/**`. `shared/` es solo lectura; si el contrato resulta insuficiente, detenerse y reportar (no improvisar tipos locales ni editar `shared/`).
- No depender de `app/api` para compilar: se verifica con el build y lint del propio workspace. No correr el `pnpm build` raíz ni `pnpm dev` completo mientras `app/api` esté roto; si se necesita una interacción en vivo contra el backend, esperar a consolidación o reportarlo.

---

# Tarea — @Agente-Backend

**Estado:** Aprobado

### Contexto
El contrato vive en `@scryland/shared` y el orquestador ya lo afinó (`StoreOffer.handle` + `imageUrl`, y los tipos `OfferVariant`/`OfferDetailResponse`). Reutilizás `StoreHttpService`, `CacheService` y `TARGET_STORES` (de `stores.constants.ts`). Replicá el patrón `ShopifySuggestAdapter` (base abstracta + subclase por tienda) para el detalle. El prefix `api` ya es global (`main.ts`), así que el endpoint es `GET /api/offers/:store/:handle`.

### Incluye
- **`shopify-suggest.adapter.ts`:** emitir `handle` y `imageUrl` (de `featured_image`) en el `StoreOffer` — hoy se descartan.
- **Nuevo adapter de detalle:** clase base abstracta sobre `/products/<handle>.js` + subclases `InekoDetailAdapter` / `PaytowinDetailAdapter` (aportan `baseUrl` + id). Shape crudo tipado en un nuevo `shopify-product.types.ts` (`options`, `option1`, `variants` con `sku`/`available`/`price`/`id`, `handle`, `featured_image`).
- **Precios ÷100** en el adapter de detalle (centavos → CLP). **No tocar `parsePrice` de `normalize.ts`** (ese es para `suggest.json`, CLP entero).
- **Parseo de SKU** `<SET>-<NUM>-<LANG>-<FINISH>-<COND>` → `condition`/`language`/`finish`. Condición: `1` Near Mint, `2` Lightly Played, `3` Moderately Played, `4` Heavily Played, `5` Damaged. `FINISH`: `NF` normal, `FO` foil. Fallback: si el SKU no matchea el patrón, parsear `option1` y dejar en `null` lo no derivable. Nunca romper.
- **Endpoint `GET /api/offers/:store/:handle`** → `OfferDetailResponse`. Controller `@Controller('offers')`. Validar `store` contra las tiendas con adapter de detalle (ineko/paytowin); catlotus o store desconocido → 404; `handle` vacío → 400.
- **Cache por `offers:<store>:<handle>`** con TTL propio y **más largo** que los 5 min de búsqueda: **30 min** (el detalle de un producto es mucho más estable que un prefijo de query).
- **`StoreHttpService.get`:** config default `{ timeout: 5000, headers: { 'User-Agent': 'Scryland/0.0.1' } }`, mergeado con el config del caller.
- **URLs:** variant → `${baseUrl}/products/${handle}?variant=${variantId}`; `productUrl` → `${baseUrl}/products/${handle}`. Sin variantes útiles → `OfferDetailResponse` con `variants: []` (el frontend degrada a imagen + enlace). No es error.

### No incluye
- `shared/`, `.spec/`, `e2e/`, archivos raíz, `app/web/`.
- Instalar dependencias ni tocar `pnpm-lock.yaml`.
- Emitir ofertas sintéticas para tiendas sin el print (4.4).
- Inventario numérico (`inventory_quantity`) — solo `available` (3.5).
- Cambiar la forma de `/api/search`.

## Plan de implementación
1. Emitir `handle` e `imageUrl` en `shopify-suggest.adapter.ts` (recupera la compilación de `app/api`).
2. Tipar el shape crudo del detalle (`shopify-product.types.ts`).
3. Crear el adapter base de detalle + subclases ineko/paytowin, con división por 100 y parseo de SKU (fallback a `option1`/`null`).
4. Crear `OffersController` + `OffersService` con cache por `offers:<store>:<handle>` (TTL 30 min) y validación de `store`/`handle`.
5. Añadir `User-Agent` + `timeout` por llamada en `StoreHttpService.get`.
6. Verificar `pnpm --filter @scryland/api build` y `pnpm --filter @scryland/api lint` (`--max-warnings=0`).

## Criterios de aceptación
- [x] `GET /api/offers/ineko/<handle>` devuelve `OfferDetailResponse` con variantes (condición/idioma/foil/precio/available) y precios en CLP (divididos por 100).
- [x] `GET /api/offers/catlotus/<handle>` (o store inválido) responde 404; `handle` vacío valida a 400.
- [x] `GET /api/search` sigue sirviendo `StoreOffer` con `handle` e `imageUrl`, sin cambios de forma.
- [x] Cache por `handle` con TTL de 30 min observable (una segunda llamada al mismo handle no reconsulta la tienda).
- [x] Las llamadas a tiendas llevan `User-Agent` propio y `timeout` 5s.
- [x] `pnpm --filter @scryland/api build` y `lint` pasan.

## Notas / restricciones
- Solo `app/api/**`. `shared/` es solo lectura; si el contrato resulta insuficiente, detenerse y reportar (no improvisar tipos locales ni editar `shared/`).
- El `pnpm build` raíz se espera **rojo** en la ventana pre-despacho → cierre de este bloque; no interpretarlo como fallo propio. Este bloque devuelve a `app/api` a verde.
- Un 404 de catlotus en logs es síntoma de un bug en la derivación de filas del frontend, no de este bloque.
