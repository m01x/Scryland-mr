# Spec 02 - Scaffold del frontend

**Estado:** Borrador
**Fecha:** 2026-08-16
**Tipo:** Simple

**Objetivo:** Montar `app/web` con React + TanStack dentro del monorepo, levantando y sirviendo una pantalla placeholder, para dejar disponible el segundo worker del patrón orquestador-trabajador.

## Alcance

### Involucra
- Orquestador — ejecuta directamente el scaffold y la configuración.
- Notion — se documenta al cerrar, en estado final.
- Humano — aprueba antes de ejecutar, revisa antes de cerrar.

### Contexto:
El monorepo tiene hoy solo `app/api` funcional. Sin `app/web` no existe el segundo worker, y por lo tanto no se puede practicar el ciclo orquestador-trabajador con dos agentes en paralelo, que es el objetivo real de este laboratorio. Esta spec monta la infraestructura mínima del frontend, sin lógica de producto ni consumo de API.

### Incluye:
- Scaffold de `app/web` con React + TypeScript (Vite) usando su CLI, dentro del workspace pnpm.
- Renombrar el paquete a `@scryland/web`.
- Alinear `tsconfig.json` del frontend con las convenciones del repo (`declaration: false`, strict activo).
- Agregar scripts en la raíz: `dev:web` y `dev` (levanta ambos, esperando a que el backend responda antes de soltar el frontend).
- Crear `app/web/AGENTS.md` declarando `shared/` y `.spec/` como solo lectura, y restringir permisos de escritura del agente frontend en `opencode.json` — en el mismo paso.
- Declarar el puerto de dev del frontend en `.env.example`.

### No incluye:
- Declarar `@scryland/shared` como dependencia de `app/web` — se hace cuando exista el contrato (mismo criterio que Spec 01).
- Consumo real de la API, componentes de producto, diseño de la grilla de cartas.
- Configuración de TanStack Router/Query más allá de lo que traiga el scaffold base.
- Testing (Jest, Playwright) — queda para spec propia.
- Modificar `app/api`.

## Plan de implementación

1. Scaffold de `app/web` con Vite + React + TypeScript (`pnpm create vite app/web --template react-ts`), sin instalar dependencias.
2. Renombrar el paquete a `@scryland/web` en su `package.json`.
3. Revisar `tsconfig.app.json`: strict activo (ya viene por defecto), agregar `declaration: false` explícito.
4. Agregar a la raíz los scripts `dev:web` y `dev`; añadir `concurrently` y `wait-on` como devDependencies de la raíz. `dev` = `concurrently -k -n api,web "pnpm dev:api" "wait-on http://localhost:3000 && pnpm dev:web"`.
5. Crear `app/web/AGENTS.md` y ajustar `opencode.json` en el mismo paso: agente `web` con escritura restringida a `app/web/**`, denegando `shared/**`, `.spec/**` y `app/api/**`.
6. Agregar el puerto de dev del frontend a `.env.example` (`WEB_PORT=5173`).
7. `pnpm install` desde la raíz; confirmar un solo lockfile y que ambos workspaces resuelven.
8. Verificar que `pnpm dev:web` levanta y sirve la pantalla placeholder, y que `pnpm dev` levanta ambos en orden (frontend solo tras HTTP-200 en `localhost:3000`).
9. Revisión humana final antes de marcar Implementado.

## Criterios de aceptación
El Orquestador ejecuta estas tareas directamente
**aqui se definen tareas especificas**
- [ ] `app/web` existe y su `package.json` declara `@scryland/web`.
- [ ] `pnpm install` desde la raíz corre limpio con un solo `pnpm-lock.yaml`.
- [ ] `pnpm dev:web` levanta el frontend y sirve la pantalla placeholder en el navegador.
- [ ] `pnpm dev` levanta backend y frontend, en ese orden, sin que el frontend arranque antes de que el backend responda.
- [ ] `app/web/AGENTS.md` declara `shared/`, `.spec/` y `app/api/` como solo lectura.
- [ ] `opencode.json` restringe la escritura del agente frontend a `app/web/**`.
- [ ] `.env.example` incluye el puerto de dev del frontend.
- [ ] `app/api` no fue modificado por esta spec.
- [ ] Humano revisa y da visto bueno final.

## Decisiones

- Vite como bundler: es el scaffold estándar de React hoy y el que asume TanStack en su documentación.
- Sin dependencia a `@scryland/shared` todavía: mismo criterio de la Spec 01 — no se crea wiring antes de que exista el contrato.
- `AGENTS.md` local y permisos en `opencode.json` se hacen en el mismo paso: separarlos deja la regla escrita pero no forzada.
- El script `dev` requiere espera real sobre el puerto, no encadenamiento simple: el proceso de Nest no termina, así que `&&` no funciona. Se usa `wait-on http://localhost:3000` (verificación HTTP-200, no solo puerto abierto) orquestado con `concurrently -k`; son dos devDependencies pequeñas en la raíz.

## Riesgos

Bajo. El único punto con fricción real es el script `dev` con espera sobre el puerto, que introduce dos dependencias nuevas en la raíz (`concurrently`, `wait-on`). Si complica, se puede posponer y dejar solo `dev:api` y `dev:web` por separado, sin bloquear el resto de la spec.
