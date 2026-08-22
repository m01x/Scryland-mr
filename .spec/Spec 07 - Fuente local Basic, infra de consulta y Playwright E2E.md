# Spec 07 - Fuente local "Basic", infra de consulta de tiendas y Playwright E2E

**Estado:** Implementado
**Fecha:** 2026-08-22
**Tipo:** Orquestador

**Objetivo:** Preparar el terreno para poder probar resultados: reemplazar la tipografía del frontend por la fuente local "Basic", montar en el backend la infraestructura de consulta a tiendas (cliente HTTP + cache TTL + esqueleto de módulo, sin scraping real), e instalar Playwright para el test de usabilidad E2E.

## Alcance

### Involucra
- **Orquestador** — redacta y mantiene esta spec, serializa todas las instalaciones (Playwright raíz, `@nestjs/axios` en api y remoción de `@fontsource-variable/*` en web), crea `e2e/` con el primer test de usabilidad, actualiza `State.md` y documenta en Notion al cierre.
- **@Agente-Frontend** — actualiza la fuente a "Basic" local dentro de `app/web`.
- **@Agente-Backend** — monta la infra de consulta (cliente HTTP + cache + esqueleto de módulo) dentro de `app/api`.
- **Humano** — aprueba, revisa y marca Implementado.

### Contexto
Spec 05 fijó las fuentes Cinzel (display) e Inter (body) vía paquetes `@fontsource-variable`; Geist quedó instalada pero sin uso. El diseñador entregó la fuente real "Basic" (Sorkin Type Co, licencia SIL OFL 1.1, un solo peso Regular) en `samples/frontend/font/Basic-Regular.ttf` junto a su `OFL.txt`. Por otro lado, el backend no tiene cliente HTTP ni cache: solo `health`, `config` y `common/filters`; para probar resultados hace falta preparar la infraestructura de consulta a las tiendas (Ineko y Paytowin, ambas con endpoints JSON). Finalmente, `e2e/` está reservada desde el día 0 pero no existe todavía: es el momento de instalar Playwright y dejar un test de usabilidad de la pantalla de búsqueda.

### Incluye
- Fuente local "Basic" como body + display, reemplazando Cinzel e Inter, con su licencia OFL incluida en el repo.
- Instalación de `@nestjs/axios` (con `axios`) y una cache TTL en memoria en el backend — solo infraestructura, sin llamadas reales a tiendas.
- Playwright (`@playwright/test`) en la raíz, carpeta `e2e/` con config y un primer test de usabilidad.

### No incluye
- Scraping real a tiendas (Ineko/Paytowin), endpoints de búsqueda funcionales, parseo de robots.txt (v1 usa allowlist manual).
- Cambios en `shared/`: los tipos `StoreOffer`, `SearchResult` y `SearchResponse` ya existen y alcanzan para esta spec.
- Rediseño de pesos tipográficos (se asume *faux bold* para los textos en negrita) ni cambios en los tokens de color de `index.css`.
- Concurrencia (`p-limit`), colas o persistencia en base de datos (fases futuras).

## Plan de implementación

1. Orquestador escribe Spec 07 en estado Borrador y pide aprobación.
2. Aprobado → el orquestador **serializa todas las instalaciones** antes del despacho en paralelo (todas tocan `pnpm-lock.yaml`): `@playwright/test` en la raíz + `playwright install`, `@nestjs/axios` + `axios` en `app/api`, y la remoción de `@fontsource-variable/*` en `app/web`.
3. Orquestador despacha en paralelo (una respuesta, una llamada `task` por subagente) los bloques de tarea a @Agente-Frontend y @Agente-Backend.
4. El orquestador crea `e2e/` con `playwright.config.ts` y el test de usabilidad, y agrega los scripts `e2e`/`e2e:ui` en la raíz.
5. Consolidación (orquestador): `pnpm build` limpio y verificación de los criterios de aceptación globales y por bloque.
6. Revisión humana y cierre: `State.md` + Notion.

## Criterios de aceptación globales

- [x] La fuente "Basic" está activa en el frontend (body + display) y los paquetes `@fontsource-variable/*` fueron retirados.
- [x] El backend expone la infra de consulta (HTTP + cache TTL + esqueleto de módulo) sin realizar llamadas reales a tiendas.
- [x] Playwright está instalado en la raíz y `e2e/` contiene al menos un test de usabilidad que corre contra la app.
- [x] `pnpm build` pasa limpio (shared → api → web) y `pnpm-lock.yaml` quedó consistente.
- [ ] Humano revisa y da visto bueno.

## Decisiones

- **Cliente HTTP `@nestjs/axios`:** integración oficial con el `HttpModule`/DI de Nest, acorde a la convención de no reinventar lo que el framework ya provee. Se eligió sobre `fetch` nativo porque se prefirió la integración con el contenedor de Nest.
- **Cache TTL en memoria (sin dependencia):** cumple el principio de "cache para minimizar carga repetida" sin sumar paquetes; `@nestjs/cache-manager` queda como upgrade futuro si se necesita configuración centralizada.
- **Playwright en `e2e/` raíz:** respeta la convención del repo ("Playwright en la raíz, territorio del orquestador, cruza frontend y backend"); no se instala dentro de `app/web`.
- **Backend solo infra en esta spec:** el scraping real y los endpoints de búsqueda quedan para una spec futura; aquí solo se prepara el terreno.
- **Fuente como asset importado (`src/assets/fonts/`):** consistente con la decisión del logo en Spec 06; Vite lo emite con hash y mantiene el recurso bajo control del componente.

## Riesgos

- **"Basic" tiene un solo peso (Regular):** los textos `font-medium`/`font-semibold`/`bold` se renderizarán con *faux bold* sintetizado por el navegador. Aceptable para v1; si se necesita un peso real, requiere otra fuente o archivos adicionales.
- **`.ttf` es más pesado que `.woff2`:** mayor payload inicial; se puede convertir a woff2 en una spec futura.
- **Instalaciones en paralelo corrompen `pnpm-lock.yaml`:** se mitiga serializando todas las instalaciones antes del despacho.
- **`playwright install` descarga navegadores:** requiere red; si falla, los tests E2E no corren hasta completar la descarga.

---

# Tarea — @Agente-Frontend

**Estado:** Implementado

### Contexto
El frontend usa hoy Cinzel (display) e Inter (body) vía `@fontsource-variable`, con Geist instalada pero sin uso (`app/web/package.json`). La fuente "Basic" (OFL 1.1, un solo peso Regular) está disponible en `samples/frontend/font/Basic-Regular.ttf`. El worker debe reemplazar ambas fuentes por "Basic" local, respetando la estructura de assets ya definida en Spec 06 (`src/assets/`).

### Incluye
- Copiar `samples/frontend/font/Basic-Regular.ttf` → `app/web/src/assets/fonts/Basic-Regular.ttf`.
- Copiar `samples/frontend/font/OFL.txt` → `app/web/src/assets/fonts/OFL.txt` (la licencia OFL exige incluir el aviso de copyright y la licencia).
- Añadir `@font-face` en `app/web/src/index.css` apuntando al `.ttf` local, con `font-display: swap`.
- Actualizar `--font-display` y `--font-sans` para resolver a "Basic" y ajustar las utilidades `.font-display`/`.font-sans` con fallbacks apropiados.
- Quitar los `@import "@fontsource-variable/cinzel"` y `@import "@fontsource-variable/inter"` de `index.css`.
- Quitar de `app/web/package.json` las dependencias `@fontsource-variable/cinzel`, `@fontsource-variable/inter` y `@fontsource-variable/geist`.
- Añadir al logo un efecto de "respiración" del glow: el `drop-shadow` estático existente pulsa suavemente mientras el mouse está sobre el logo, y al salir vuelve sutilmente al estado base (sin corte abrupto). Implementado con Tailwind (`hover:` + animación arbitraria `animate-[...]` + transición de `filter`) y un keyframe `logo-breathe`; respeta `prefers-reduced-motion: reduce`.

### No incluye
- Backend (`app/api`), `shared/`, `.spec/`, `e2e/`, archivos raíz.
- Rediseño de pesos tipográficos ni cambios en los tokens de color.
- Instalar dependencias nuevas: la remoción se sincroniza con el lockfile en la fase de instalación serial del orquestador.

## Plan de implementación
1. Copiar el `.ttf` y el `OFL.txt` a `src/assets/fonts/`.
2. Editar `index.css`: reemplazar los `@import` de fontsource por un `@font-face` local y actualizar `--font-display`/`--font-sans` y las utilidades.
3. Editar `package.json` quitando las tres dependencias `@fontsource-variable/*`.
4. Verificar `pnpm --filter @scryland/web build` y `pnpm --filter @scryland/web lint`.

## Criterios de aceptación
- [x] `app/web/src/assets/fonts/Basic-Regular.ttf` y `app/web/src/assets/fonts/OFL.txt` existen.
- [x] `index.css` referencia la fuente local vía `@font-face` y no quedan `@import` de `@fontsource-variable`.
- [x] `--font-display` y `--font-sans` resuelven a "Basic".
- [x] `package.json` no lista `@fontsource-variable/cinzel`, `@fontsource-variable/inter` ni `@fontsource-variable/geist`.
- [x] El logo conserva su glow base y, al hacer hover, el glow "respira" (pulso continuo); al quitar el mouse vuelve sutilmente (transición, sin salto). Efecto hecho con Tailwind y neutralizado bajo `prefers-reduced-motion: reduce`.
- [x] `pnpm --filter @scryland/web build` y `pnpm --filter @scryland/web lint` pasan.

## Notas / restricciones
- No tocar `pnpm-lock.yaml` ni ejecutar `pnpm install`: la sincronización del lockfile la hace el orquestador en la fase serial.

---

# Tarea — @Agente-Backend

**Estado:** Implementado

### Contexto
El backend no tiene cliente HTTP ni cache (`app/api/package.json` solo lista Nest core, config, validación y shared). Para probar resultados se necesita preparar la infraestructura de consulta a las tiendas. Esta spec no incluye scraping real: solo el cliente HTTP, una cache TTL en memoria y el esqueleto del módulo de tiendas.

### Incluye
- Instalar `@nestjs/axios` y `axios` (la instalación la ejecuta el orquestador en la fase serial; el worker reporta la necesidad y usa las deps).
- Registrar `HttpModule` en `app.module.ts` con un `timeout` razonable.
- Crear `src/stores/` con un esqueleto de módulo: constantes de las tiendas objetivo (Ineko, Paytowin) sin endpoints de consulta todavía.
- Crear un `StoreHttpService` que envuelva el cliente HTTP (`HttpService` de `@nestjs/axios`).
- Crear un `CacheService` de cache TTL en memoria (Map + timestamp, expiración de entradas vencidas).

### No incluye
- Llamadas reales a tiendas, endpoints de búsqueda/controladores de tiendas, parseo de robots.txt.
- Cambios en `shared/` (los tipos `StoreOffer`, `SearchResult`, `SearchResponse` ya existen).
- Frontend (`app/web`), `.spec/`, `e2e/`, archivos raíz.

## Plan de implementación
1. Verificar que `@nestjs/axios` y `axios` estén en `package.json` (instalados por el orquestador).
2. Registrar `HttpModule` con timeout en `app.module.ts`.
3. Crear `src/stores/` con el esqueleto de módulo y constantes de tiendas.
4. Implementar `StoreHttpService` (wrapper de `HttpService`) y `CacheService` (TTL en memoria).
5. Verificar `pnpm --filter @scryland/api build`.

## Criterios de aceptación
- [x] `@nestjs/axios` y `axios` están listados en `app/api/package.json` como dependencias.
- [x] `HttpModule` está registrado en `app.module.ts` con timeout.
- [x] Existen `src/stores/` con el esqueleto de módulo y las constantes de Ineko/Paytowin.
- [x] `StoreHttpService` y `CacheService` (TTL en memoria) existen y compilan.
- [x] No hay ninguna llamada real a tiendas en el código.
- [x] `pnpm --filter @scryland/api build` pasa.

## Notas / restricciones
- No tocar `pnpm-lock.yaml` ni ejecutar instalaciones: reportar al orquestador cualquier dependencia faltante.
- Si el contrato de `shared/` resulta insuficiente, detenerse y reportarlo; no editarlo.
