# Spec 06 - Reestructuración shadcn, logo real y nav WatchTower

**Estado:** Implementado.
**Fecha:** 2026-08-18
**Tipo:** Simple

**Objetivo:** Recrear la pantalla de búsqueda (`/`) usando componentes shadcn como base —en lugar de transcribir el mockup con markup y estilos a mano—, incorporar el logo real de Scryland, agregar el botón "WatchTower" al nav superior, y simplificar la importación de la página al router dejándola autocontenida en `feature/search/page/`.

## Alcance

### Involucra
- **Orquestador** — redacta y mantiene esta spec en `.spec/`, actualiza `State.md` y documenta en Notion al cierre. No escribe código en `app/web/`.
- **@Agente-Frontend** — toda la implementación dentro de `app/web/` (assets, feature `search`, componentes `ui/`, refactor del router).
- **Humano** — aprueba, revisa y marca Implementado.

### Contexto
Spec 05 maquetó la pantalla de búsqueda transcribiendo el mockup (`SampleConcept.png` + design system HTML) con markup y clases oklch a mano. Ese trabajo era un concepto, no el destino: la idea es que la UI se construya sobre componentes shadcn, cuyos tokens ya están mapeados a la paleta "nebula" en `app/web/src/index.css`. El diseñador ya entregó el logo real (`samples/frontend/scryland-logo.svg`). El nav superior hoy tiene solo "Home" y "Perfil" como `<button disabled>` display-only; falta "WatchTower". Por último, la convención "la página vive en `feature/<nombre>/page/`" se complicó con un wrapper `SearchRoot` + barrels; hay que simplificarla.

Estado actual del árbol de trabajo (sin commitear): `page/SearchPage.tsx`, `page/SearchRoot.tsx` y `page/index.tsx` están eliminados, y `routes/index.tsx` ya importa `SearchPage` directo. El build está roto hasta recrear `SearchPage.tsx` autocontenido.

### Incluye
- Copiar `samples/frontend/scryland-logo.svg` → `app/web/src/assets/scryland-logo.svg` (nueva carpeta `assets/`) y reescribir `Logo.tsx` para usar `<img>` en vez del SVG inline.
- Agregar "WatchTower" al nav, orden `Home · WatchTower · Perfil`, display-only (sin rutas ni navegación).
- Agregar los componentes shadcn `badge` y `card` (`shadcn add`), sin dependencias nuevas.
- Recrear la página sobre shadcn: `Nav` → `Button`, `SearchBox` → `Card`+`CardContent`+`Badge`+icono `lucide-react`, `FiltersBar` → `Button` `outline`+`ChevronDown`+`Badge`, `PrintCard` → `Card` (`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`), `StoreRow` → `Badge`.
- Reemplazar los SVGs a mano (lupa, chevron) por iconos de `lucide-react`.
- Recrear `feature/search/page/SearchPage.tsx` autocontenido (inyecta `searchResults` directamente), borrar `feature/search/index.ts`, y mantener `routes/index.tsx` importando `@/feature/search/page/SearchPage` directo, sin JSX propio.

### No incluye
- Backend / `app/api`, `shared/`, `.spec/`, archivos raíz, `e2e/`.
- Navegación real ni rutas nuevas (`/watchtower`, `/perfil`). El nav sigue display-only.
- Búsqueda funcional, filtros interactivos, estado o handlers.
- Reescribir `app/web/src/index.css` (los tokens ya existen; solo se consumen).
- Tests, CI, E2E.
- Cambiar el `variant: "accent"` del `Button` (ya existe desde Spec 05).

## Plan de implementación
1. Orquestador escribe Spec 06 en estado Borrador y pide aprobación.
2. Aprobado → despacho del bloque de tarea a @Agente-Frontend.
3. Consolidación (orquestador): `pnpm --filter @scryland/web build` y `pnpm --filter @scryland/web lint`, y verificación de los criterios de aceptación.
4. Revisión humana y cierre.

## Criterios de aceptación
- [x] `app/web/src/assets/scryland-logo.svg` existe y `Logo.tsx` lo renderiza vía `<img>` (no SVG inline).
- [x] El nav superior muestra `Home`, `WatchTower` y `Perfil` (display-only), construido con `Button` shadcn.
- [x] La pantalla `/` sigue renderizando: hero, logo + nav, caja de búsqueda, filtros, 4 cards y contador.
- [x] `badge` y `card` existen en `app/web/src/components/ui/` y se usan en la página; no queda markup/estilos "transcritos" del mockup (los SVGs a mano se reemplazan por `lucide-react`).
- [x] `feature/search/page/SearchPage.tsx` es autocontenido; no existen `SearchRoot.tsx` ni los barrels (`feature/search/index.ts`, `page/index.tsx`).
- [x] `src/routes/index.tsx` importa `@/feature/search/page/SearchPage` y no contiene JSX propio.
- [x] `pnpm --filter @scryland/web build` y `pnpm --filter @scryland/web lint` pasan.
- [x] Humano revisa y da visto bueno.

## Decisiones
- **Tipo Simple (solo `app/web`):** el logo se copia a `assets/` dentro del territorio del worker; no hay cambios en `index.css`, `package.json` raíz ni `shared/`.
- **Logo como asset importado (`src/assets/`), no inline ni `public/`:** Vite lo emite con hash y no lo inlinea; mantiene el logo bajo control del componente.
- **Nav display-only:** no hay páginas de destino todavía; la navegación queda para una spec futura.
- **Alcance shadcn acotado a primitivas que existen:** Button/Badge/Card. `HeroNebula` y las fuentes display (Cinzel) quedan custom porque shadcn no las cubre.

## Riesgos
- **Peso del logo (1.7MB):** se mitiga usando `<img>` con dimensiones explícitas; el mark liviano ya existe como `public/favicon.svg`.
- **`shadcn add` podría intentar instalar dependencias y tocar `pnpm-lock.yaml`:** verificar que `badge`/`card` no requieran deps nuevas (`radix-ui` unificado ya es dependencia); si las requieren, reportar al orquestador antes de instalar.
- **Perder fidelidad visual vs mockup al migrar a shadcn:** aceptable; la idea es recrear sobre shadcn, no transcribir.
- **Regresión del estado `unavailable`/`accent` de las cards al migrar a `Card`:** conservar tokens y variantes existentes.
