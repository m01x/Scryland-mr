# Spec 01 - Consolidación Shared y Convención de Specs

**Estado:** Implementado
**Fecha:** 2026-08-15
**Tipo:** Simple

**Objetivo:** Corregir la ubicación de `shared/` y la nomenclatura de `.spec/` para que disco, `pnpm-workspace.yaml`, `opencode.json`, `AGENTS.md` y Notion queden consistentes entre sí.

## Alcance

### Involucra
- Orquestador — ejecuta directamente los cambios de código y configuración.
- Notion — se actualiza en paralelo, mismo alcance.
- Humano — aprueba antes de ejecutar, revisa antes de cerrar.

### Contexto:
`shared` se creó en la raíz del monorepo (`/shared`), pero Notion y la documentación previa lo referenciaban como `packages/shared`. Del mismo modo, la carpeta de trabajo de specs quedó como `.spec` (singular, mayúscula inicial en archivos), mientras que Notion todavía documentaba `.specs` (plural, minúscula). El disco es la fuente de verdad; esta spec alinea todo lo demás a lo que ya existe construido.

### Incluye:
- Actualizar `pnpm-workspace.yaml` para reconocer `shared` en la raíz.
- Verificar y eliminar cualquier carpeta `packages/` vacía remanente del scaffold anterior.
- Declarar `shared/` y `.spec/` como solo lectura para `app/api` (y a futuro `app/web`) en `app/api/AGENTS.md` y en `opencode.json`.
- Actualizar Notion: reemplazar toda mención de `packages/shared` por `shared/`, y de `.specs/state.md/spec-001-...` por `.spec/State.md/Spec 00 - Título.md`.
- Alinear la documentación en disco: `AGENTS.md` raíz y `Spec 00 - Scaffold del backend.md` (`packages/shared` → `shared/`, y `.spec/Spec-format.md` → `Simple-Spec-format.md` / `Orchestrator-Spec-format.md`).

### No incluye:
- Definir el contenido del contrato de `shared` (tipos de `CardPrint`, `StoreOffer`, etc.) — eso es producto, se define cuando toque implementarlo.
- Crear `shared/package.json` ni declarar `@scryland/shared` como dependencia de `app/api` — se define cuando exista el contrato.
- El flujo de trabajo con loops de re-trabajo entre agentes — eso es la Spec 02, pendiente por separado.
- Cambios en `app/web`, que todavía no existe.

## Plan de implementación

1. Editar `pnpm-workspace.yaml`: agregar `shared` junto a `app/*`.
2. Revisar el árbol del repo; si existe `packages/` vacía, eliminarla (actualmente ya no existe, solo confirmar).
3. Crear/editar `app/api/AGENTS.md` y ajustar `opencode.json` en el mismo paso: la regla explícita `shared/` y `.spec/` son de solo lectura se escribe y se fuerza a la vez; cualquier necesidad de cambio se reporta al orquestador, no se edita directo.
4. Alinear la documentación en disco: `AGENTS.md` raíz y `Spec 00` (`packages/shared` → `shared/`, `.spec/Spec-format.md` → `Simple-Spec-format.md` / `Orchestrator-Spec-format.md`).
5. Correr `pnpm install` desde la raíz y confirmar que resuelve sin error (`shared` aún no registra `package.json`, así que pnpm la omite hasta que exista).
6. En paralelo, actualizar Notion con la nomenclatura corregida (lo hace el orquestador directamente, sin pasar por agente).
7. Revisión humana final antes de marcar Implementado.

## Criterios de aceptación
El Orquestador ejecuta estas tareas directamente
**aqui se definen tareas especificas**
- [x] `pnpm-workspace.yaml` incluye `shared` como entrada del workspace.
- [x] No queda ninguna carpeta `packages/` en el repo.
- [x] `app/api/AGENTS.md` declara `shared/` y `.spec/` como solo lectura, y `opencode.json` restringe la escritura de `app/api` fuera de su propia carpeta (ambos en el mismo paso).
- [x] `AGENTS.md` raíz y `Spec 00` ya no referencian `packages/shared` ni `.spec/Spec-format.md`.
- [x] `pnpm install` corre limpio; `shared` queda en el glob del workspace (a la espera de su `package.json`).
- [x] Notion refleja `shared/` (no `packages/shared`) y `.spec/State.md/Spec NN - Título.md` (no `.specs/state.md/spec-00N-titulo.md`) en toda la página.
- [x] Humano revisa y da visto bueno final.

## Decisiones

- `shared` vive en la raíz, no dentro de `packages/`: el disco ya está construido así, se corrige la documentación en vez del código.
- `shared` es de solo lectura para los workers: mismo principio ya aplicado a `.spec/` — un solo escritor evita divergencias entre frontend y backend.
- La regla de solo-lectura se escribe (`app/api/AGENTS.md`) y se fuerza (`opencode.json`) en el mismo paso: separarlos deja la regla declarada pero sin efecto.
- Notion se actualiza en el mismo ciclo que el código, no después: evita que vuelva a quedar desincronizado como ocurrió esta vez.

## Riesgos

Bajo. Es una spec de consolidación sin lógica de negocio de por medio; el mayor riesgo es que quede algún archivo con la nomenclatura vieja sin detectar — se mitiga con una búsqueda de texto (`packages/shared`, `.specs`, `.spec/Spec-format.md`) antes de cerrar.
