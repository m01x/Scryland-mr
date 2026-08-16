# Spec 05 – UI de búsqueda de Scryland

**Estado:** Implementado
**Fecha:** 2026-08-16
**Tipo:** Orquestador (un solo bloque `@Agente-Frontend`; orquestador toca `index.css`, `app/web/package.json` y `shared/`)

**Objetivo:** Maquetar la pantalla de búsqueda de Scryland en `app/web` siguiendo `samples/frontend/SampleConcept.png` y `samples/frontend/Scryland Design System (standalone).html`, con arquitectura modular por features donde la página **vive en la feature** y `src/routes/` es solo delegación.

## Alcance

### Involucra
- **Orquestador** — edición de `app/web/src/index.css` (overrides de tokens nebulosos sobre shadcn), instalación de `Cinzel` + `Inter` en `app/web/package.json`, agregado de tipos `SearchResult`/`StoreOffer` a `shared/src/types/index.ts`, `pnpm install` final, documentar al cerrar.
- **@Agente-Frontend** — toda la implementación de la pantalla dentro de `app/web/src/feature/search/`, refactor del router para delegar la página, mock data, validación de build/lint.
- **Humano** — aprueba, revisa, marca Implementado.
- **Notion** — fila en SDD al cerrar.

### Contexto
Ya tenemos el scaffold de `app/web` (Spec 02), los tokens de shadcn y el router file-based (Spec 03). Esta spec es la **primera feature de producto** del frontend. La pantalla de búsqueda es la cara visible del comparador y ya tiene un mockup definitivo (`samples/frontend/SampleConcept.png`) y un design system documentado (`samples/frontend/Scryland Design System (standalone).html`). No hay backend de búsqueda todavía; todo se maqueta con mocks hardcoded.

La convención de features está fijada en `app/web/AGENTS.md` ("Arquitectura de features (frontend)"): `src/feature/<nombre>/{components/,page/}` con la página viviendo en `page/`. El router nunca contiene markup propio — es una capa de delegación pura.

### Incluye
- **Override global de tokens:** reescribir `:root` (no `.dark`) de `app/web/src/index.css` con los oklch nebulosos del design system. Mantener aliases shadcn (`--background`, `--card`, `--primary`, etc.) apuntando a los tokens nebulosos para que los componentes shadcn existentes hereden el look. Botón shadcn actual sigue compilando.
- **Fuentes:** agregar `@fontsource/cinzel` (display) y `@fontsource-variable/inter` (body) en `app/web/package.json`. Declarar `--font-display` y `--font-sans` en `@theme inline`.
- **Tipos compartidos** (orquestador, pre-despacho): `SearchResult` y `StoreOffer` en `shared/src/types/index.ts`, consumidos con `import type` desde la feature.
- **Arquitectura modular por features:** crear `app/web/src/feature/search/` con esta estructura:
  - `app/web/src/feature/search/page/index.tsx` — la página que el router importa. Exporta `Route` (`createFileRoute`).
  - `app/web/src/feature/search/components/HeroNebula.tsx` — hero con gradiente animado.
  - `app/web/src/feature/search/components/SearchBox.tsx` — caja "RESULTADO DE BÚSQUEDA". Solo display (ver Aceptación).
  - `app/web/src/feature/search/components/FiltersBar.tsx` — Disponibilidad + Ordenar por + contador.
  - `app/web/src/feature/search/components/CardGrid.tsx` — grid responsivo de cards.
  - `app/web/src/feature/search/components/PrintCard.tsx` — card individual (imagen placeholder, título, set, lista de tiendas, CTA).
  - `app/web/src/feature/search/components/StoreRow.tsx` — fila tienda+precio (dot verde/rojo/cian, label, precio, "Sin stock").
  - `app/web/src/feature/search/components/Logo.tsx` — SVG inline del logo (torre + luna + wordmark).
  - `app/web/src/feature/search/components/Nav.tsx` — botones "Home" / "Perfil" (display, no interactivo en esta spec).
  - `app/web/src/feature/search/data/mockResults.ts` — array tipado de 4 ediciones de "Sol Ring" (Commander Masters, Revised, 30th Anniversary, Sin edición disponible).
  - `app/web/src/feature/search/index.ts` — barrel.
- **Router como delegación pura:** `app/web/src/routes/index.tsx` debe mantener su `createFileRoute` (TanStack file-based) pero su cuerpo se reduce a un `export { Route } from '@/feature/search/page'`. El router no conoce markup, solo la convención con TanStack.
- **Animación del hero:** gradiente radial cyan/violeta rotando a 60s con `@keyframes` en CSS. Respeta `prefers-reduced-motion: reduce`.
- **Responsive:** lg (≥1024px) → 4 cards; md (768–1023) → 2; sm (<768) → 1. Nav, search box y filtros siempre 100%.
- **Estados de card:** tres variantes — `best-price` (verde mint con CTA destacado), `available` (default), `unavailable` (CTA deshabilitado, glow rojo).
- **Modificación de `app/web/src/components/ui/button.tsx`:** el worker puede agregar un `variant: "accent"` (verde mint, según el mock) a `buttonVariants`. La modificación está dentro del scope del worker (`app/web/src/components/ui/` es territorio compartido del frontend, ya cubierto por su AGENTS.md cuando la spec lo declara explícitamente — esto cumple con la regla "es responsabilidad explícita del worker declarada en la spec").

### No incluye
- Backend de búsqueda. Los datos viven en `mockResults.ts`.
- Formularios funcionales: la `SearchBox` es solo display (no estado, no submit).
- Filtros interactivos: Disponibilidad/Ordenar por son visuales; no mutan estado en esta spec.
- Navegación a detalle de carta, a perfil, o a página de tienda.
- Routing dinámico (`/search/:cardId`).
- Tests, CI, E2E.
- Cambios al logo de producción (es un SVG inline de maqueteo; el logo final viene del diseñador).
- Hover/click motion (solo motion ambient del hero).
- Cambios al `release` del design system en tokens distintos al scope (`spec.md` del HTML no es docs aquí).

## Plan de implementación
1. **Orquestador (serial, pre-despacho):**
   a. Reescribir `:root` de `app/web/src/index.css` con los tokens nebulosos (aliases shadcn apuntando a oklch nebulosos).
   b. Agregar `@fontsource/cinzel` y `@fontsource-variable/inter` a `app/web/package.json` (`dependencies`).
   c. Agregar `SearchResult` y `StoreOffer` a `shared/src/types/index.ts`.
   d. Correr `pnpm install` desde la raíz (asienta el lockfile).
2. **Despacho:** un solo bloque, `@Agente-Frontend`. Implementa toda la feature, refactor del router, mock data.
3. **Consolidación (orquestador):**
   a. `pnpm build` (raíz).
   b. `pnpm --filter @scryland/web lint` (oxlint).
   c. Verificación de aceptación: `grep -E "<[A-Za-z]" src/routes/index.tsx` debe matchear **solo** el `Route` exportado desde la feature (no debe haber otros tags JSX propios).
   d. Verificar responsive manualmente (build vs breakpoints en CSS).
4. **Revisión humana.**

## Criterios de aceptación globales
- [x] La pantalla `/` coincide con `SampleConcept.png` en desktop (4 cards, hero nebuloso, filters, "4 ediciones encontradas").
- [x] `app/web/src/feature/search/` existe con la estructura completa.
- [x] `src/routes/index.tsx` no contiene markup propio; `grep -E "<[A-Za-z]" src/routes/index.tsx` (o `Select-String -Pattern "<[A-Za-z]"` en PowerShell) no matchea tags JSX propios — solo el `Route` que delega a `SearchRoot`.
- [x] `pnpm --filter @scryland/web build` y `pnpm --filter @scryland/web lint` pasan.
- [x] En breakpoints mobile (≤767px) hay 1 card; en tablet (768–1023) hay 2; en desktop (≥1024) hay 4.
- [x] `prefers-reduced-motion: reduce` detiene la animación del hero.
- [x] Tipos `SearchResult` + `StoreOffer` viven en `shared/src/types/` y se consumen con `import type`.
- [x] `SearchBox` es un componente de solo display: **no incluye manejo de estado, handlers de submit, ni interacción alguna**. Renderiza solo el contenido decorativo.
- [x] El `Button` shadcn usa las clases/tokens definidos en `index.css` (`bg-primary`, `text-primary-foreground`, `bg-accent`) sin overrides ad-hoc en el markup.
- [x] Humano revisa y da visto bueno.

## Decisiones
- **Override global del shadcn (no capa adicional):** un solo sistema de tokens. Las features futuras no van a tener dos fuentes de verdad. Riesgo: si queremos un componente shadcn charts en otra spec, va a heredar el nebula — pero eso es coherente con la marca Scryland.
- **Nombre de la feature:** `search` (singular, kebab-case). Paralelo con `home` y `watchtower` ya creadas en `app/web/src/feature/`. La página es "resultado de búsqueda" pero el nombre corto queda bien en el router tree.
- **Página en `page/index.tsx` (no `page/page.tsx`):** convención TS de carpetas. El worker lee la convención del AGENTS.md local ("page/" como carpeta, no como archivo).
- **Logo SVG inline (no archivo):** evita bundlear el archivo de 2.2MB y mantiene el logo bajo el control del componente. Para el logo de producción, el designer reemplaza el componente.
- **Motion solo en el hero (no en cards):** respetar "menos es más". El hero es la tesis; las cards quedan quietas para no ensuciar la lectura de precios.
- **Mock data hardcoded (no JSON file):** la spec es solo maqueteo. Mocks vivir en `app/web/src/feature/search/data/mockResults.ts` y se migrarán a backend cuando llegue la spec de búsqueda.
- **Orquestador edita `index.css` y `package.json`:** los tokens y la fuente son pre-requisitos que el worker no puede tocar (estos archivos son raíz del scope del worker, están en la lista de solo-lectura del AGENTS.md local). El orquestador los prepara en el pre-despacho.
- **Orquestador edita `shared/`:** los tipos son contrato entre frontend y backend. El worker lee, no escribe. El orquestador los define.
- **Variant `accent` en el `Button` compartido:** declarado explícitamente en esta spec para que la modificación de `app/web/src/components/ui/button.tsx` sea parte del `Incluye` (cumple la regla de AGENTS.md "modificación a ui/ declarada en la spec").
- **Router file-based de TanStack:** se mantiene `createFileRoute` en `src/routes/index.tsx` (TanStack lo exige en file-based). La feature expone su `Route` y el `index.tsx` solo re-exporta.
- **No tocar `.spec/` ni `e2e/`** desde el worker; solo el orquestador.

## Riesgos
- **Alias duplication shadcn↔nebula:** al reescribir `:root`, los CSS vars `--primary`, `--card`, etc. heredan valores nebulosos. Componentes shadcn que usan `bg-primary` se ven violetas en vez de grises. Coherente con la marca. Mitigado: el build verifica que las clases no rompen.
- **Cinzel es serif, no estándar para UI:** riesgo de legibilidad en small text. Mitigado: usando Cinzel solo en wordmark y eyebrows (`tracking-[.14em]` al 12px), Inter para todo lo demás.
- **Build size:** el Hero animado es CSS puro, sin librerías. No agrega bundle.
- **Responsive con Tailwind v4:** las clases `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` son estándar. Riesgo bajo.
- **Lint del backend con deuda preexistente:** esta spec no corre lint del backend. Sin riesgo nuevo.
- **Modificación del `Button` compartido:** el `variant: "accent"` impacta a TODAS las features que ya usan el Button. Si `home` o `watchtower` se maquetan luego, el accent estará disponible pero no usado. Aceptable: el variant es aditivo, no reemplaza nada.

---

## Notas de implementación (post-consolidación)

- **Divergencia del router reportada por el worker:** `@tanstack/router-generator@1.167.30` descarta `export { Route } from '...'` en el routeTree. El worker dejó `src/routes/index.tsx` con `createFileRoute('/')({ component: SearchRoot })` literal (sin JSX propio). El espíritu del AGENTS.md ("el router nunca contiene markup") se preserva; la letra del snippet de la spec, no. Si una versión futura del generador arregla esto, basta con volver `page/index.tsx` a exportar `Route` con `createFileRoute` y borrar `SearchRoot.tsx`.
- **Estructura final de la feature:** `page/index.tsx` re-exporta `SearchRoot`, `page/SearchRoot.tsx` recibe `query`/`results` y delega a `<SearchPage />`, `page/SearchPage.tsx` es el presentacional. El router sigue sin markup.
- **`SearchResult.available` no existe en `shared/`:** el worker derivó `isUnavailable` en `PrintCard.tsx` con `result.offers.every(o => !o.available)`. Si querés formalizar el flag como campo canónico en `shared/`, queda como mini-edit del orquestador.

---

# Tarea — @Agente-Frontend

**Estado:** Implementado

### Contexto
Tienes el scaffold de `app/web` con shadcn/Tailwind/shadcn theme, router file-based, y un `index.tsx` que hace `useQuery` a `/api/health`. El orquestador ya terminó la edición de `app/web/src/index.css` (tokens nebulosos), agregó `@fontsource/cinzel` + `@fontsource-variable/inter` a `package.json`, y agregó `SearchResult` + `StoreOffer` a `shared/src/types/index.ts`. Tu trabajo es implementar la feature `search` con arquitectura modular, los mocks, y dejar el router como mera delegación.

### Incluye
- Crear `app/web/src/feature/search/` con la estructura indicada.
- `app/web/src/feature/search/page/index.tsx` que usa `createFileRoute` y exporta `Route`. Internamente compone `Logo`, `Nav`, `HeroNebula`, `SearchBox`, `FiltersBar`, `CardGrid`.
- Componentes listados en el scope (estrictamente dentro de `app/web/src/feature/search/`).
- Mock data: `app/web/src/feature/search/data/mockResults.ts` con el array tipado de 4 prints de "Sol Ring" hardcoded: Commander Masters 2023, Revised Edition, 30th Anniversary, "Sin edición disponible" (sin stock).
- Modificar `app/web/src/components/ui/button.tsx` para agregar `variant: "accent"` (verde mint, según el mock). El nuevo variant se declara explícitamente en `buttonVariants.cva` y referencia `bg-accent text-accent-foreground` (los tokens ya vendrán del override en `:root`).
- Refactor de `app/web/src/routes/index.tsx` para que su cuerpo sea `export { Route } from '@/feature/search/page'` (más el `createFileRoute` mínimo que TanStack file-based exige).
- Responsive con Tailwind v4: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`.
- Animación del hero con `@keyframes` + `prefers-reduced-motion: reduce` que la detiene.
- Logo SVG inline (torre + luna + wordmark "SCRYLAND" en Cinzel dorado).
- `SearchBox` estrictamente de solo display: renderiza el contenido, **no maneja estado, no define handlers, no es interactivo**.

### No incluye
- Cambios a `app/web/src/index.css` (ya lo hizo el orquestador).
- Cambios a `app/web/package.json` (ya lo hizo el orquestador).
- Cambios a `shared/` (ya lo hizo el orquestador).
- Tocar `app/api/`, `.spec/`, `.gitignore`, `package.json` raíz, `.env`.
- Instalar dependencias adicionales.
- Implementar backend.
- Hacer interactivo `SearchBox` o los filtros.

### Plan de implementación
1. Verificar que `app/web/src/index.css` ya tiene los tokens nebulosos y que `Cinzel` + `Inter` están en `package.json` (pre-despacho del orquestador).
2. Modificar `app/web/src/components/ui/button.tsx` para agregar `variant: "accent"` (un único cambio aditivo).
3. Crear `app/web/src/feature/search/` con todos los componentes, la estructura listada y `index.ts`.
4. Crear `app/web/src/feature/search/data/mockResults.ts` con el array tipado.
5. Refactorizar `app/web/src/routes/index.tsx` para que re-exporte `Route` desde `@/feature/search/page`.
6. Verificar `pnpm --filter @scryland/web build` y `pnpm --filter @scryland/web lint`.
7. Verificar que `grep -E "<[A-Za-z]" src/routes/index.tsx` solo matchea el `Route` re-exportado (no debe haber otros tags JSX propios del router).

### Criterios de aceptación
- [x] `app/web/src/feature/search/` existe con la estructura completa y `page/index.tsx` exporta `SearchRoot` (la `Route` vive en `routes/index.tsx` por la limitación del router-generator — ver Notas de implementación).
- [x] `src/routes/index.tsx` no contiene markup propio; `Select-String -Pattern "<[A-Za-z]" src/routes/index.tsx` no matchea tags JSX propios (solo `createFileRoute` delegando a `SearchRoot`).
- [x] `SearchBox` es solo display: no tiene `useState`, no tiene `onSubmit`, no tiene `onChange`, no es interactivo.
- [x] Hero animado respeta `prefers-reduced-motion: reduce`.
- [x] 4 cards visibles en lg, 2 en md, 1 en sm.
- [x] El `Button` shadcn modificado tiene ahora `variant: "accent"` disponible.
- [x] El CTA "Ver mejor precio" en la card 2 (best-price, P2W) usa `variant="accent"`.
- [x] `pnpm --filter @scryland/web build` y `lint` pasan.
- [x] Tipos `SearchResult` + `StoreOffer` se importan con `import type` desde `@scryland/shared`.

### Notas / restricciones
- `shared/`, `.spec/`, `app/api/`, archivos raíz y `app/web/src/index.css` + `app/web/package.json` son de solo lectura para el worker.
- No instalar dependencias.
- Modificación de `app/web/src/components/ui/button.tsx` para agregar el variant `accent` está autorizada por esta spec (es el único cambio en `components/ui/`).
- Si necesitas un detalle de contratos con `shared/`, repórtalo al orquestador.
