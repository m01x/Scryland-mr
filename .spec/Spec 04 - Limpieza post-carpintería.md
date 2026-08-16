# Spec 04 - Limpieza post-carpintería

**Estado:** Implementado
**Fecha:** 2026-08-16
**Tipo:** Orquestador

**Objetivo:** Resolver las cuatro observaciones fuera de alcance que dejó la Spec 03: limpiar dependencias del frontend (CLI `shadcn` fuera del bundle de producción, `@radix-ui/react-slot` redundante), asegurar que `src/routeTree.gen.ts` se commitea, apuntar el `wait-on` del `dev` raíz a `/api/health`, y hacer que `AllExceptionsFilter` loguee stack solo para 5xx.

## Alcance

### Involucra
- **Orquestador** — cambia el `wait-on` del script `dev` raíz (punto 3); verifica y commitea `routeTree.gen.ts` (punto 2); consolida, corre el `pnpm install` final y actualiza `State.md`/Notion al cerrar.
- **@Agente-Frontend** — limpia dependencias en `app/web` (punto 1).
- **@Agente-Backend** — ajusta `AllExceptionsFilter` en `app/api` (punto 4).
- **Humano** — aprueba antes de ejecutar, revisa antes de cerrar.
- **Notion** — documentación al cerrar (estado final).

### Contexto
La Spec 03 dejó cuatro deudas de carpintería documentadas en su sección "Notas fuera de alcance". Son correcciones mecánicas pero cruzan los tres territorios: dependencias en `app/web`, log de excepciones en `app/api`, y script raíz + git en la raíz. Ninguna toca lógica de producto.

### Incluye
- `app/web`: mover `shadcn` de `dependencies` a `devDependencies` y quitar `@radix-ui/react-slot` (redundante; el `Button` ya importa `Slot` desde el paquete consolidado `radix-ui`).
- Raíz: apuntar `wait-on` del script `dev` a `http://localhost:3000/api/health`.
- Git: verificar que `app/web/src/routeTree.gen.ts` no está en ningún `.gitignore` y queda trackeado (commiteado).
- `app/api`: `AllExceptionsFilter` loguea con stack solo para 5xx; los 4xx en una línea sin stack.

### No incluye
- Nada de lógica de producto, cartas, tiendas ni endpoints nuevos.
- Cambios al contrato de `shared/`.
- Testing (Jest/Playwright), CI/CD.

## Plan de implementación

1. **Orquestador (serial, pre-despacho):** cambia el `wait-on` del script `dev` raíz a `/api/health` (punto 3), confirmando antes el prefijo global `api` y la ruta `health` (ya verificado en disco: `setGlobalPrefix('api')` en `main.ts` y `@Controller('health')` + `@Get()` en `HealthController`). Verifica por read-only que `routeTree.gen.ts` no está ignorado por ningún `.gitignore` (hoy no lo está) y confirma que quedará trackeado en el commit final (punto 2).
2. **Despacho en paralelo:** bloques `@Agente-Frontend` (punto 1) y `@Agente-Backend` (punto 4). Solo el frontend toca `pnpm-lock.yaml`; el backend no instala nada, así que no hay escritura concurrente de lockfile entre los dos.
3. **Consolidación:** el orquestador corre `pnpm install` final desde la raíz (asienta el lockfile tras el cambio de dependencias), `pnpm build` y `oxlint`, verifica los criterios globales y commitea `routeTree.gen.ts`.
4. **Revisión humana.**

## Criterios de aceptación globales
- [x] `pnpm dev` arranca sin ruido de 404 en consola (el `wait-on` resuelve contra `/api/health`, que responde 2XX).
- [x] Un 404 provocado a mano se loguea en una línea, sin stack.
- [x] Un 500 provocado a mano sí muestra stack trace.
- [x] `pnpm build` (raíz) y `oxlint` (`pnpm --filter @scryland/web lint`) pasan; `shadcn` aparece bajo `devDependencies` en `app/web/package.json` y en el importer correspondiente del lockfile.
- [x] `app/web/src/routeTree.gen.ts` está trackeado en git y no está en ningún `.gitignore`; un clone limpio buildeará sin correr el codegen antes.
- [x] Humano revisa y da visto bueno.

## Decisiones
- **Tipo Orquestador (no Simple):** la clasificación es por territorio, no por tamaño. Cruza `app/web` + `app/api` + raíz, y el orquestador no puede escribir código en `app/api`/`app/web`, por lo que los puntos 1 y 4 exigen workers. El punto 3 y el commit del punto 2 son del orquestador.
- **`wait-on http://…` emite HEAD:** wait-on exige 2XX en HEAD/GET. Destino verificado en disco: `main.ts` setea `setGlobalPrefix('api')` y el controller es `@Controller('health')` + `@Get()`, así que la ruta es `/api/health`. Express/Nest mapea HEAD→GET en rutas `@Get()`, por lo que `HEAD /api/health` responde 200. Fallback si HEAD diera problemas: `http-get://localhost:3000/api/health` (fuerza GET).
- **4xx en una línea, mismo nivel de log (intencional):** no se cambia el nivel (`logger.error`), solo se omite el stack para 4xx; el cambio mínimo pedido es "una línea, sin stack". Se asume el costo (un 404 en nivel error) como reversible: si en el futuro ensucia alertas, se baja a `warn` en otra spec.
- **Commitear `routeTree.gen.ts` (elección, no hecho dado):** se consideró y descartó meter `tsr generate` dentro del script `build` (que regeneraría el archivo y quitaría la necesidad de commitearlo). Se commitea el generado porque es lo que TanStack Router recomienda, evita acoplar el build a una fase de codegen y mantiene `tsc -b` verde en clone limpio sin pasos previos.
- **El criterio "borrar routeTree.gen.ts y buildear" no es fiable:** `build` de web es `tsc -b && vite build`; `tsc -b` importa `./routeTree.gen` antes de que el plugin de router lo regenere. La verificación robusta de "clone limpio" es confirmar que el archivo está **trackeado** (`git ls-files`) y no ignorado (`git check-ignore`), no borrarlo a mano.
- **Lint solo en el web en esta spec:** el criterio global `oxlint` aplica solo al web (`pnpm --filter @scryland/web lint`). El `lint` del backend (ESLint) tiene deuda preexistente ajena a esta spec (ver Riesgos) y no se usa como criterio; su verificación es `build` + `tsc`.

## Riesgos
- **Lockfile compartido:** solo el frontend instala; no hay concurrencia. Mitigado con el `pnpm install` final del orquestador.
- **Remover `@radix-ui/react-slot` de más:** mitigado porque el `Button` ya importa `Slot` desde `radix-ui` (verificado en `app/web/src/components/ui/button.tsx`), y el build de web lo confirma.
- **"Borra y buildear" roto por orden de scripts:** riesgo de falsa alarma en la verificación; mitigado usando el chequeo de "trackeado + no ignorado" como criterio real.
- **Lint del backend con deuda preexistente:** `pnpm --filter @scryland/api exec eslint "{src,apps,libs,test}/**/*.ts"` ya falla hoy (prettier/CRLF en `app.service.ts` y `all-exceptions.filter.ts`, warning `no-floating-promises` en `main.ts`). Ajeno a esta spec; por eso el bloque backend no corre `lint` como criterio. Deuda a resolver en una spec de limpieza posterior (normalizar EOL, acotar el glob a `src` y decidir el `--fix`).

---

# Tarea — @Agente-Frontend

**Estado:** Implementado

### Contexto
`app/web/package.json` tiene `shadcn@^4.18.0` en `dependencies` (es un CLI, va en `devDependencies`) y `@radix-ui/react-slot@^1.3.3` redundante: el `Button` de shadcn ya importa `{ Slot }` desde el paquete consolidado `radix-ui` (verificado en `src/components/ui/button.tsx`).

### Incluye
- Mover `shadcn` de `dependencies` a `devDependencies` en `app/web/package.json`.
- Quitar `@radix-ui/react-slot`.
- Actualizar el lockfile con un único `pnpm install`.

### No incluye
- Cambiar dependencias de `app/api` o `shared/`.
- Modificar el `Button` ni otro componente (el import actual ya es correcto).
- Tocar `package.json` raíz, `.env`, `.spec/` o `.gitignore`.

### Plan de implementación
1. Verificar que nada más importa el slot: `grep -rn "react-slot" src/` (se espera solo `button.tsx`, que importa `Slot` desde `radix-ui`).
2. Editar `app/web/package.json` (mover `shadcn` a `devDependencies`, borrar `@radix-ui/react-slot`).
3. Correr `pnpm install` (único worker que instala; reportar al terminar).
4. Verificar `pnpm --filter @scryland/web build` y `pnpm --filter @scryland/web lint` (oxlint).
5. Verificar en `pnpm-lock.yaml` que `shadcn` quedó bajo el importer dev de `@scryland/web`.
6. Reportar.

### Criterios de aceptación
- [x] `shadcn` está en `devDependencies`, no en `dependencies`.
- [x] `@radix-ui/react-slot` eliminado y `grep -rn "react-slot" src/` solo lo reportaba en `button.tsx`; `Button` sigue compilando (importa `Slot` desde `radix-ui`).
- [x] `pnpm --filter @scryland/web build` y `lint` pasan.
- [x] `shadcn` aparece bajo `devDependencies` en `app/web/package.json` y su entrada en `pnpm-lock.yaml` está bajo el importer dev de `@scryland/web` (no runtime).
- [x] `pnpm-lock.yaml` quedó íntegro (sin conflicto, un solo install).

### Notas / restricciones
- `shared/`, `.spec/`, `app/api/` y archivos raíz son solo lectura.
- No instalar dependencias nuevas fuera de lo contemplado.

---

# Tarea — @Agente-Backend

**Estado:** Implementado

### Contexto
`AllExceptionsFilter.catch` hoy loguea `exception.stack` para **toda** excepción (4xx y 5xx). Un 404 es operación normal; solo los 5xx deben loguear stack.

### Incluye
- Ajustar el log en `app/api/src/common/filters/all-exceptions.filter.ts`: stack solo para `status >= 500`; 4xx en una línea sin stack.

### No incluye
- Cambiar la forma del cuerpo `ApiError` ni el contrato de `shared/`.
- Nuevos filtros, middleware o endpoints.
- Instalar dependencias.

### Plan de implementación
1. Editar la llamada a `this.logger.error` en `all-exceptions.filter.ts` para ramificar por `status >= 500`.
2. Verificar `pnpm --filter @scryland/api build`.
3. Reportar.

### Criterios de aceptación
- [x] Un 4xx se loguea en una línea (sin `stack`).
- [x] Un 5xx se loguea con `stack`.
- [x] `pnpm --filter @scryland/api build` pasa.
- [x] No se tocó nada fuera de `app/api`.

### Notas / restricciones
- `shared/`, `.spec/`, `app/web/` y archivos raíz son solo lectura.
- Mantener el nivel de log actual (`error`); solo se suprime el stack en 4xx.
- **No se corre `pnpm --filter @scryland/api lint`:** el script `lint` de `app/api` falla hoy por deuda preexistente ajena a esta spec (ver Riesgo "Lint del backend con deuda preexistente"). La verificación es `build` + `tsc`; no se toca el lint ni se agrega `--fix`.
