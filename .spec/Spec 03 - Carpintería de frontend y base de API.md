# Spec 03 - Carpintería de frontend y base de API

**Estado:** Implementado
**Fecha:** 2026-08-16
**Tipo:** Orquestador

**Objetivo:** Dejar lista la carpintería del frontend (Tailwind, shadcn, TanStack Query + Router con devtools) y la base de la API (config con validación de env, prefijo `/api`, CORS, ValidationPipe global, health check y filtro de excepciones global), con un smoke test end-to-end que prueba el cableado vía el primer `useQuery` contra `GET /api/health`. Es la primera spec orquestador: dos workers en paralelo más el primer contrato en `shared/`.

## Alcance

### Involucra
- **Orquestador** — redacta y dirige; crea el contrato `@scryland/shared` (`HealthResponse`, `ApiError`) con su build de `.d.ts` y los scripts raíz `build:shared` y `build`; actualiza `AGENTS.md` raíz con las reglas estructurales nuevas; consolida los resultados; actualiza `State.md` y Notion al cerrar.
- **@Agente-Backend** — base de API en `app/api`.
- **@Agente-Frontend** — herramientas en `app/web`.
- **Notion** — documentación al cerrar, en estado final.
- **Humano** — aprueba antes de ejecutar, revisa antes de cerrar.

### Contexto
`app/api` es el scaffold Nest pelado: `main.ts` lee `process.env.PORT ?? 3000` crudo, expone `Hello World!` en `/` y no tiene prefijo, CORS, validación ni manejo de errores estándar. `app/web` es el scaffold Vite + React de demo, sin Tailwind, shadcn ni TanStack. Hoy no existe el primer contrato: `shared/` está vacío (Spec 01/02 lo dejaron para cuando hubiera contrato). El health y la forma de error son ese primer contrato real entre ambos lados.

### Incluye
- `shared/` como paquete `@scryland/shared` con `HealthResponse` y `ApiError` (interfaces puras, sin decoradores Nest), con build de `.d.ts` (`declaration: true`, `emitDeclarationOnly: true`) y `types` apuntando al `dist/` emitido.
- Script raíz `build:shared`, que corre antes del build del backend.
- Script raíz `build` que encadena `build:shared` → build de `app/api` → build de `app/web`.
- Backend: `@nestjs/config` con validación de env (la app no arranca si falta una variable requerida), prefijo global `/api`, CORS, `ValidationPipe` global, `GET /api/health` y filtro de excepciones global con forma de error estándar.
- `APP_VERSION` como variable de entorno (en schema Joi y `.env.example`), leída por el health desde `ConfigService` sin tocar el filesystem.
- `.env` de la raíz como fuente explícita del `ConfigModule` (`envFilePath`), con paso documentado de `cp .env.example .env`.
- Frontend: Tailwind v4, shadcn/ui (con componente `button` instalado), TanStack Query + Router (file-based) con sus devtools, alias `@/*`, proxy de Vite `/api → localhost:<PORT>` leyendo `PORT` del `.env` raíz vía `loadEnv`, y un `useQuery` mínimo contra `/api/health` como smoke test.

### No incluye
- HttpModule, adaptadores de tiendas, DTOs de cartas → **Spec 04**.
- La "primera vista" real (grilla de cartas, búsqueda, diseño final) → **Spec 04**.
- Testing (Jest/Playwright) — queda para spec propia.
- CI/CD, deploy.

## Plan de implementación

### Paso 1 — Preparación de la raíz (orquestador, serial)

Los cinco puntos siguientes son territorio del orquestador y deben estar **todos** completos antes del despacho. Ninguno es opcional ni diferible: el backend no arranca sin `APP_VERSION` en el `.env`, y el frontend no puede construir el target del proxy sin `PORT` en ese mismo archivo.

- [x] 1.1 Crear `shared/` (paquete `@scryland/shared` + contrato `HealthResponse`/`ApiError` + build de `.d.ts`).
- [x] 1.2 Agregar el script raíz `build:shared`.
- [x] 1.3 Agregar el script raíz `build` (encadena `build:shared` → build `app/api` → build `app/web`).
- [x] 1.4 Agregar `APP_VERSION` a `.env.example` y crear el `.env` de la raíz (`cp .env.example .env`).
- [x] 1.5 Actualizar `AGENTS.md` raíz con las reglas estructurales nuevas.

**Compuerta de despacho:** si cualquiera de los cinco está incompleto, el despacho del paso 2 no ocurre. El orquestador verifica y reporta los cinco antes de continuar.

### Paso 2 — Despacho en paralelo

Despacho de los bloques `@Agente-Backend` y `@Agente-Frontend` (cada uno declara `@scryland/shared` en su `package.json`).

**Instalación serializada.** Existe un único `pnpm-lock.yaml` en la raíz; dos `pnpm install` concurrentes lo corrompen. El orquestador serializa así:

1. Despacha al primer worker y espera a que termine **su** `pnpm install`.
2. Recién entonces despacha el `pnpm install` del segundo worker.
3. El resto del trabajo de ambos bloques (código, configuración, verificación) sí corre en paralelo.
4. Al consolidar, el orquestador corre un `pnpm install` final desde la raíz para asentar el lockfile.

Si el runtime de agentes no permite esa granularidad, la alternativa es que el orquestador ejecute **ambos** `pnpm install` él mismo, antes de despachar, con las dependencias declaradas en la spec.

### Paso 3 — Consolidación

Orquestador consolida, verifica la integración (proxy → `/api/health` → useQuery), corre el `pnpm install` final y actualiza `.spec/State.md`.

### Paso 4 — Revisión humana

## Criterios de aceptación globales
- [x] Los cinco puntos del paso 1 están completos y verificados **antes** del despacho de los workers.
- [x] El `pnpm-lock.yaml` quedó íntegro: un solo lockfile, `pnpm install` final limpio, sin conflictos de escritura concurrente.
- [x] `shared/` exporta `HealthResponse` y `ApiError`, y ambos workers compilan contra él sin duplicar tipos.
- [x] `pnpm build` en `app/api` produce `dist/main.js` en la raíz de `dist/` (no `dist/app/api/src/main.js`).
- [x] `GET /api/health` responde 200 con `{ status, uptime, version }` (versión desde `APP_VERSION`).
- [x] La app de Nest no arranca si falta una variable de env requerida.
- [x] El frontend levanta con Tailwind + shadcn + TanStack (Query + Router) con devtools, y muestra el resultado del health vía `useQuery`.
- [x] `pnpm install`, `build` y `dev` corren limpios desde la raíz.
- [x] `app/api` y `app/web` no se tocaron entre sí.
- [x] Humano revisa y da visto bueno.

## Decisiones
- `shared/` se crea ahora: el health y la forma de error son el primer contrato real; evita divergencias desde el día uno.
- `shared` **compila a `.d.ts`** (`declaration: true` + `emitDeclarationOnly: true`) y su `package.json` apunta `types` al `dist/` emitido, no al fuente: si `tsc` de `app/api` metiera el `.ts` en su programa, el `rootDir` inferido subiría a la raíz del monorepo y `dist/` pasaría a `dist/app/api/src/main.js`, rompiendo `start:prod` (`node dist/main`) en silencio. Los consumidores siguen usando `import type` (no hay runtime export).
- `APP_VERSION` como variable de entorno, no lectura de `../package.json` en runtime: evita el mismo problema de `rootDir` y el re-path del JSON con `resolveJsonModule` al emitir a `dist`.
- Joi para validación de env (receta canónica de Nest); `class-validator`/`class-transformer` se agregan para el `ValidationPipe` global y quedan listos para los DTOs de Spec 04.
- `.env` de la raíz como fuente explícita (`envFilePath` resuelto de forma robusta, no relativo al `cwd`): un clone limpio + `cp .env.example .env` arranca desde cualquier `cwd`.
- Fuente única de variables de entorno en la raíz del monorepo: no existen `.env.example` por worker; front y back leen el `.env` de la raíz.
- Proxy de Vite + CORS: el query client usa URLs relativas (`/api/...`); el target del proxy se construye con `loadEnv` leyendo `PORT` del `.env` raíz, para no hardcodear `localhost:3000` mientras el backend tenga `PORT` configurable.
- TanStack Router file-based con `@tanstack/router-plugin` (codegen de rutas), estructura en `src/routes/`.
- Tailwind v4 vía `@tailwindcss/vite` (sin `tailwind.config.js` por defecto).
- **Paso 1 serial, compuerta explícita**: la preparación de la raíz no se paraleliza con los workers. Los cinco puntos son precondición dura del despacho.
- **Instalación serializada entre workers**: un solo `pnpm-lock.yaml` no tolera escrituras concurrentes; los `pnpm install` van uno después del otro aunque el resto del trabajo sea paralelo.

## Riesgos
- **Despacho prematuro**: si el orquestador paraleliza antes de completar el paso 1, ambos bloques mueren en su primer comando (backend sin `APP_VERSION`, frontend sin `PORT` para el proxy). Mitigado por la compuerta explícita del paso 1 y su criterio de aceptación.
- **Lockfile compartido**: dos `pnpm install` concurrentes sobre el único `pnpm-lock.yaml` lo corrompen. Mitigado por la serialización descrita en el paso 2, el `pnpm install` final del orquestador y su criterio de aceptación.
- **Integridad de `dist`/rootDir**: consumir `@scryland/shared` mal resuelto rompe `dist/`. Mitigado con el build de `.d.ts` y el criterio de `dist/main.js` en la raíz.
- **shadcn init vs oxlint**: el init puede asumir ESLint; acá el linter es oxlint. Se ajusta a mano si el init lo asume.
- **Orden crítico** alias `@/*` → `shadcn init` (ya advertido en el bloque frontend).
- **Primer spec orquestador**: riesgo de proceso (paralelización, límites de escritura). Mitigado por permisos ya definidos en `opencode.json`.

## Notas fuera de alcance (para spec de limpieza posterior)

Surgidas de la revisión humana. No se corrigen aquí; van a una spec de limpieza posterior:

1. **shadcn CLI en `dependencies`**: shadcn v4 agregó el CLI `shadcn` como dependency (debería ir en `devDependencies`) y dejó `@radix-ui/react-slot` redundante (usa el paquete consolidado `radix-ui`).
2. **`src/routeTree.gen.ts` debe commitearse**: no está en `.gitignore` y `tsc -b` lo necesita para pasar en un clone limpio.
3. **Ruido de `HEAD /` → 404 en cada `pnpm dev`**: `wait-on` hace polling a `http://localhost:3000` (la raíz), que ya no tiene ruta desde que existe el prefijo `/api`. Cada ping devuelve 404 legítimo y el `AllExceptionsFilter` lo loguea con stack trace completo. Fix propuesto: apuntar `wait-on` a `http://localhost:3000/api/health` (espera a que la API esté sana, no solo a que el puerto abra).
4. **`AllExceptionsFilter` loguea stack trace para 4xx**: un 404 es operación normal, no un fallo de programa. Fix propuesto: stack trace solo para 5xx; los 4xx se loguean en una línea sin stack.

---

# Tarea — @Agente-Backend

**Estado:** Implementado

### Contexto
Hoy `main.ts` lee `process.env.PORT ?? 3000` crudo y expone el "Hello World!" en `/`. No hay prefijo, CORS, validación ni manejo de errores estándar. Este bloque monta la base sobre la que el frontend (y Spec 04) se apoyan.

### Incluye
- Dependencias: `@nestjs/config`, `joi`, `class-validator`, `class-transformer`, y `@scryland/shared` (`workspace:*`).
- `ConfigModule` global con schema de validación que exige `PORT` y `APP_VERSION`, y `envFilePath` apuntando explícitamente al `.env` de la raíz del monorepo (no relativo al `cwd`).
- `main.ts`: `PORT` desde `ConfigService`, `setGlobalPrefix('api')`, `enableCors()`, `useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`, `useGlobalFilters(new AllExceptionsFilter())`.
- `GET /api/health` → `{ status, uptime, version }` (version desde `APP_VERSION` vía `ConfigService`).
- Filtro de excepciones global con forma de error estándar (`ApiError` de shared).
- Reportar `APP_VERSION` al orquestador para que lo agregue a `.env.example`.
- Correr `build:shared` antes de su `build` y verificar `dist/main.js` en la raíz de `dist/`.

### No incluye
- HttpModule, adaptadores de tiendas, DTOs de cartas (Spec 04).
- Modificar `app/web` o `shared/`.

### Plan de implementación
1. Instalar dependencias y declarar `@scryland/shared` (`workspace:*`). **Reportar al orquestador al terminar el `pnpm install`, antes de seguir** (el lockfile es compartido y los installs van serializados).
2. Crear `src/config/env.validation.ts` (schema Joi que exige `PORT` y `APP_VERSION`).
3. Registrar `ConfigModule.forRoot` global en `app.module.ts` (con `envFilePath` explícito a la raíz).
4. Crear `src/health/health.controller.ts` (+ service) con `GET /health`.
5. Crear `src/common/filters/all-exceptions.filter.ts` con forma `ApiError`.
6. Reescribir `main.ts` (prefijo, CORS, pipes, filtro).
7. Verificar `pnpm dev:api` desde la raíz (lee el `.env` raíz creado por el orquestador).
8. `pnpm build:shared` + `pnpm --filter @scryland/api build` y verificar `dist/main.js` en la raíz de `dist/`.
9. Reportar.

### Criterios de aceptación
- [x] `pnpm dev:api` desde la raíz arranca leyendo el `.env` de la raíz; si `PORT` o `APP_VERSION` faltan o son inválidos, la app no arranca.
- [x] `GET /api/health` → 200 `{ status, uptime, version }` con `version` = `APP_VERSION`.
- [x] `GET /api` (hello) responde 200 bajo el prefijo.
- [x] CORS habilitado (verificable vía request cross-origin / headers OPTIONS).
- [x] Un error dispara la forma `ApiError` estándar.
- [x] `pnpm build` produce `dist/main.js` en la raíz de `dist/`, no anidado.
- [x] Compila contra `@scryland/shared` sin tipos duplicados.

### Notas / restricciones
- `shared/` y `.spec/` son solo lectura: si `HealthResponse`/`ApiError` no cubren algo, reportar al orquestador, no editar.
- `.env.example` de la raíz es territorio del orquestador; el backend reporta el valor nuevo (`APP_VERSION`) y el orquestador lo aplica.
- **Lockfile compartido**: no correr `pnpm install` en paralelo con el otro worker. El orquestador coordina el orden; este bloque avisa cuando su install terminó.

---

# Tarea — @Agente-Frontend

**Estado:** Implementado

### Contexto
Hoy `app/web` es el scaffold Vite + React pelado (`App.tsx` de demo). Faltan Tailwind, shadcn, TanStack Query + Router y el alias `@/*`. Este bloque deja las herramientas listas y las prueba con un smoke test contra `/api/health`.

### Incluye
- Tailwind v4 (vía `@tailwindcss/vite`).
- Alias `@/*` en `tsconfig.app.json` + `tsconfig.json` y `vite.config.ts` (`resolve.alias`) **antes** de correr `shadcn init`.
- shadcn/ui init (`components.json`, `lib/utils.ts` con `cn()`, theme CSS) y `pnpm dlx shadcn@latest add button`. Eliminar CSS/demo de Vite.
- TanStack Query: `@tanstack/react-query` + `@tanstack/react-query-devtools`; `QueryClientProvider` en la raíz.
- TanStack Router file-based: `@tanstack/react-router` + `@tanstack/router-plugin/vite` + `@tanstack/router-devtools`; estructura `src/routes/` con codegen.
- Proxy de Vite: `/api → http://localhost:<PORT>`, con `PORT` leído del `.env` de la raíz vía `loadEnv` (no hardcodeado).
- Ruta raíz placeholder que hace `useQuery` a `/api/health`, muestra `status`/`uptime`/`version` y usa el `Button` de shadcn.
- `@scryland/shared` (`workspace:*`) para el tipo `HealthResponse`.

### No incluye
- La "primera vista" real (grilla de cartas, búsqueda, diseño final) → Spec 04.
- Consumir endpoints de cartas/tiendas.
- Modificar `app/api` o `shared/`.

### Plan de implementación
1. Instalar dependencias (Tailwind, shadcn, TanStack) y declarar `@scryland/shared` (`workspace:*`). **Reportar al orquestador al terminar el `pnpm install`, antes de seguir** (el lockfile es compartido y los installs van serializados).
2. Configurar alias `@/*` en `tsconfig.app.json` y `vite.config.ts`.
3. Correr `shadcn init` y `pnpm dlx shadcn@latest add button`.
4. Integrar Tailwind en `index.css` y `main.tsx`; eliminar CSS/demo de Vite.
5. Montar `QueryClientProvider` + devtools.
6. Montar Router file-based (plugin + `src/routes/`) con router-devtools.
7. Configurar proxy `/api` en `vite.config.ts` con `loadEnv` (leer `PORT` del `.env` raíz).
8. Ruta raíz con `useQuery` a `/api/health` usando `HealthResponse` y el `Button` de shadcn.
9. Verificar `pnpm dev` end-to-end (health visible); `oxlint` y `build` pasan.
10. Reportar.

### Criterios de aceptación
- [x] Tailwind aplica (clases utilitarias funcionan); CSS demo eliminado.
- [x] `shadcn init` corrió, `button` instalado y `@/*` resuelve (el `Button` importa bien y se usa en la ruta raíz).
- [x] TanStack Query + devtools montados; `useQuery` a `/api/health` resuelve y muestra `status`.
- [x] TanStack Router file-based sirve la ruta raíz; router-devtools visible.
- [x] Proxy `/api` funciona usando `PORT` del `.env` raíz (no `localhost:3000` hardcodeado).
- [x] `pnpm build` y `oxlint` pasan.
- [x] Compila contra `@scryland/shared` sin tipos duplicados.

### Notas / restricciones
- `shared/`, `.spec/` y `app/api/` son solo lectura.
- **Orden crítico**: alias `@/*` antes de `shadcn init` (si se invierte, el init falla o escribe rutas malas).
- Tailwind v4 no usa `tailwind.config.js` por defecto; se configura en CSS (`@import "tailwindcss"`) + `@tailwindcss/vite`.
- `shadcn init` puede asumir ESLint; acá el linter es oxlint — si lo asume, ajustar/reportar.
- `loadEnv` debe apuntar su `envDir` a la raíz del monorepo para leer el `.env` raíz, no el de `app/web`.
- **Lockfile compartido**: no correr `pnpm install` en paralelo con el otro worker. El orquestador coordina el orden; este bloque avisa cuando su install terminó.