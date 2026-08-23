# Spec 08 - Limpieza de lint del backend (EOL, no-floating-promises y glob)

**Estado:** Implementado
**Fecha:** 2026-08-22
**Tipo:** Orquestador

**Objetivo:** Saldar la deuda de lint del backend documentada en Spec 04: normalizar EOL a LF (durable vía `.gitattributes`), corregir `no-floating-promises` en `main.ts`, acotar el glob del script `lint` a `src`, quitarle el `--fix` y dejar el criterio de lint verificable por exit code con `--max-warnings=0`.

## Alcance

### Involucra
- **Orquestador** — agrega `.gitattributes` en la raíz (`* text=auto eol=lf` + líneas `binary`), actualiza `State.md` y documenta en Notion al cierre.
- **@Agente-Backend** — toda la limpieza dentro de `app/api` (EOL, config prettier/eslint, `main.ts`, scripts `lint`/`lint:fix`).
- **Humano** — aprueba, revisa y marca Implementado.

### Contexto
Spec 04 dejó documentada (Riesgos/Decisiones) una deuda de lint del backend diferida a "una spec de limpieza posterior": CRLF detectado por prettier, `no-floating-promises` en `main.ts`, y el glob del script `lint` apuntando a carpetas inexistentes. Nadie la tocó en Specs 05/06/07.

Estado verificado hoy:
- `git ls-files --eol` muestra `i/lf w/crlf` en todo el repo (el índice ya está 100% LF; el working tree está en CRLF por `core.autocrlf=true` en Windows). Hay **9** archivos `.ts` trackeados en `app/api/src` con `w/crlf`, más `.prettierrc` y `eslint.config.mjs`.
- `pnpm --filter @scryland/api exec eslint "src/**/*.ts"` falla: 3 errores (`app.service.ts` y `all-exceptions.filter.ts` por CRLF/formato) + 1 warning (`main.ts:20` `no-floating-promises`).
- Causa del CRLF: `eslint.config.mjs` tiene `"prettier/prettier": ["error", { endOfLine: "auto" }]`, pero Prettier 3.x (aquí 3.9.6) eliminó `"auto"`; por eso prettier usa `lf` y marca los CRLF del working tree.
- Agravante: los `src/stores/*.ts` de Spec 07 quedaron en LF → EOL mixto en el working tree.

### Incluye
- Raíz: `.gitattributes` con `* text=auto eol=lf` y las líneas `*.ttf binary`, `*.woff binary`, `*.woff2 binary`, `*.png binary`, `*.ico binary`.
- `app/api`: `endOfLine: "lf"` en `.prettierrc` y en `eslint.config.mjs` (reemplaza el `"auto"` inválido).
- Normalizar a LF los `.ts` de `app/api/src/` (con `prettier --write`, portable entre Windows y Linux).
- `main.ts`: `void bootstrap();` (resolver `no-floating-promises`).
- `all-exceptions.filter.ts`: colapsar la condición multilínea (formato prettier).
- Scripts en `app/api/package.json`: `lint` = `eslint "src/**/*.ts" --max-warnings=0`; `lint:fix` = `eslint "src/**/*.ts" --fix`.

### No incluye
- Frontend (`app/web`), `shared/`, lógica de producto, endpoints.
- CI/CD ni testing.
- Bajar el nivel de reglas ni relajar `--max-warnings` (los warnings se corrigen en código).
- Cambiar el nivel de `no-floating-promises` (sigue `warn`; solo se corrige la ocurrencia en `main.ts`).

## Plan de implementación

1. Orquestador escribe Spec 08 en estado Borrador y pide aprobación.
2. Aprobado → el orquestador crea `.gitattributes` en la raíz (no hay instalaciones ni cambios de deps, así que no hay fase serial de lockfile).
3. Orquestador despacha el bloque de tarea a @Agente-Backend.
4. Consolidación (orquestador): `pnpm --filter @scryland/api lint` (exit 0), `pnpm --filter @scryland/api build`, `git ls-files --eol app/api/src` (todo `w/lf`) y `git status --short` (ningún binario como `M`).
5. Revisión humana y cierre: `State.md` + Notion.

## Criterios de aceptación globales

- [x] `pnpm --filter @scryland/api lint` sale con exit code 0 (`--max-warnings=0`).
- [x] `git ls-files --eol app/api/src` muestra todo `i/lf w/lf` (sin CRLF en working tree).
- [x] `.gitattributes` raíz existe con `* text=auto eol=lf` y las líneas `binary` para `ttf/woff/woff2/png/ico`.
- [x] Ningún archivo binario (`*.ttf/.woff/.woff2/.png/.ico`) aparece como `M` en `git status --short` tras crear el `.gitattributes`.
- [x] `pnpm --filter @scryland/api build` pasa.
- [ ] Humano revisa y da visto bueno.

## Decisiones

- **EOL LF:** el repo ya guarda 100% LF (0 archivos `i/crlf`); LF es el estándar portable. El `.gitattributes` fuerza LF en el checkout futuro para que Windows con `autocrlf=true` no reintroduzca CRLF.
- **`.gitattributes` en raíz (Orquestador):** cubre todo el repo, no solo `app/api`, y fija explícitamente los formatos binarios (fuentes/imágenes) para que git nunca los trate como texto.
- **`--fix` fuera de `lint`:** `lint` no muta; se agrega `lint:fix` como vía explícita de auto-fix (no deja el repo sin reemplazo).
- **`--max-warnings=0`:** el criterio "0 warnings" se vuelve verificable por exit code, no por lectura humana de la salida.
- **Normalización con `prettier --write`:** portable (sin scripts de shell específicos de Windows), y normaliza EOL + formato en un solo paso.
- **`endOfLine: "lf"` explícito** en `.prettierrc` y `eslint.config.mjs`, en lugar del `"auto"` roto.

## Riesgos

- **Normalizar EOL no debe generar diff:** verificado que el índice es `i/lf` en todo el repo; si aparece diff, es cambio real. El `.gitattributes` con `binary` explícito evita que git renormalice (y corrompa) fuentes/imágenes.
- **`--max-warnings=0` puede destapar warnings no previstos** fuera de `main.ts`: se corrigen en código; si no son corregibles, el worker se detiene y reporta (no se relajan reglas).
- **Windows + `autocrlf=true`:** el `.gitattributes eol=lf` surte efecto en checkouts futuros; la normalización actual la hace `prettier --write` (no `git checkout`, que descartaría cambios no commiteados).

---

# Tarea — @Agente-Backend

**Estado:** Aprobado

### Contexto
El backend tiene deuda de lint: EOL CRLF en el working tree (el índice ya es LF), `no-floating-promises` en `main.ts:20`, un glob de lint con carpetas inexistentes, y un `endOfLine: "auto"` que Prettier 3.x no soporta. La spec resuelve todo sin tocar `shared/` ni la raíz.

### Incluye
- Fijar `"endOfLine": "lf"` en `app/api/.prettierrc`.
- Cambiar `eslint.config.mjs`: `"prettier/prettier": ["error", { endOfLine: "auto" }]` → `{ endOfLine: "lf" }`.
- Guardar `.prettierrc` y `eslint.config.mjs` **con EOL LF** (no los cubre el glob `src/**/*.ts`).
- Normalizar `app/api/src/**/*.ts` a LF con `prettier --write "src/**/*.ts"` (también arregla el formato de `all-exceptions.filter.ts`).
- Editar `main.ts`: `bootstrap();` → `void bootstrap();`.
- `package.json`: `lint` = `eslint "src/**/*.ts" --max-warnings=0`; `lint:fix` = `eslint "src/**/*.ts" --fix`.

### No incluye
- Frontend (`app/web`), `shared/`, `.spec/`, `e2e/`, archivos raíz (el `.gitattributes` es del orquestador).
- Instalar dependencias ni tocar `pnpm-lock.yaml`.
- Bajar el nivel de reglas ni relajar `--max-warnings`.

## Plan de implementación
1. Fijar `endOfLine: "lf"` en `.prettierrc` y `eslint.config.mjs`; guardar ambos con EOL LF.
2. Correr `prettier --write "src/**/*.ts"` (normaliza EOL + formato).
3. Editar `main.ts` → `void bootstrap();`.
4. Actualizar los scripts `lint` y `lint:fix` en `package.json`.
5. Verificar `pnpm --filter @scryland/api lint` (exit 0) y `pnpm --filter @scryland/api build`.

## Criterios de aceptación
- [x] `pnpm --filter @scryland/api lint` sale con exit code 0 (sin errores ni warnings).
- [x] `git ls-files --eol app/api/src` muestra todo `w/lf` (sin CRLF en working tree).
- [x] `.prettierrc` y `eslint.config.mjs` tienen `endOfLine: "lf"` (sin `"auto"`) y EOL LF.
- [x] `main.ts` no dispara `no-floating-promises`.
- [x] Scripts: `lint` = `eslint "src/**/*.ts" --max-warnings=0`; `lint:fix` = `eslint "src/**/*.ts" --fix`.
- [x] `pnpm --filter @scryland/api build` pasa.

## Notas / restricciones
- Si `lint` arroja warnings fuera de `main.ts`, corregirlos en código: no bajar reglas ni relajar `--max-warnings`; si no es corregible, detenerse y reportar al orquestador.
- No tocar `.gitattributes` (raíz), `shared/`, `.spec/`, `e2e/`, `pnpm-lock.yaml` ni instalar dependencias.
