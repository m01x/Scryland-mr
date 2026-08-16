# AGENTS.md — app/web (Frontend)
 
Worker aislado del frontend de Scryland. Escribe únicamente dentro de esta carpeta.
 
## Rol
 
- Frontend React + TanStack en `app/web` (`@scryland/web`). Todo lo que se escribe vive dentro de `app/web/`.
- Recibe del orquestador un **bloque de tarea** de una spec ya aprobada. No decide alcance, no abre specs, no cambia estados.
## Lectura / escritura
 
- **Escritura:** solo `app/web/**` (excluyendo `.agents/` y `.claude/`).
- **Solo lectura:** `shared/` (contrato `@scryland/shared`), `.spec/` y `app/api/`. Se pueden leer para observar, nunca editar.
- Si necesitas cambiar el contrato de `shared/` o cualquier spec de `.spec/`, detente y repórtalo al orquestador; no lo edites directo.
- Backend (`app/api`) es territorio de otro worker: solo lectura, nunca escritura.
- `State.md`, archivos raíz y `e2e/` son del orquestador: no se tocan.
## Orientación al entorno (antes de cada tarea)
 
No asumas el entorno de memoria; léelo:
 
- **`app/web/package.json`** — dependencias y scripts realmente disponibles. Si necesitas algo que no está listado, no lo instales: repórtalo al orquestador.
- **`app/web/.agents/skills/`** — qué skills tienes hoy. Se pueblan a medida que crece el proyecto, así que la lista cambia entre sesiones.
- **`.env.example` / `.env` de la raíz** — variables y puertos vigentes (fuente única).
- **`shared/`** — el contrato actual, antes de escribir cualquier tipo propio.
- **`.spec/State.md` y la spec vigente** — para entender el contexto de tu bloque de tarea.
Si algo que lees en disco contradice este documento, gana el disco y se reporta la divergencia.
 
## Skills
 
- Antes de implementar, revisa `app/web/.agents/skills/` y aplica las reglas que correspondan a la tarea.
- `SKILL.md` de cada skill es el índice; las reglas concretas están en `rules/`.
- `.claude/skills/` es un espejo generado y `skills-lock.json` lo administra la herramienta: **no editar ninguno a mano**.
- Si una regla de skill choca con lo que pide la spec, no elijas por tu cuenta: reporta el conflicto al orquestador.
## Ciclo de trabajo
 
1. Lee el bloque de tarea asignado y el contrato de `shared/` que aplica.
2. Revisa las skills relevantes.
3. Implementa dentro de `app/web/`.
4. Verifica que compila y que los criterios de aceptación del bloque se cumplen.
5. Reporta al orquestador.
**No hagas:**
 
- Marcar tareas como aprobadas o cambiar el `Estado` de una spec (eso es humano).
- Definir tipos propios que dupliquen lo que debería vivir en `shared/`: si falta un campo, se reporta.
- Trabajo fuera del bloque asignado, aunque veas algo mejorable: repórtalo, no lo implementes.
- Instalar dependencias no contempladas en la spec sin reportarlo antes.
## Convenciones
 
- Vite, React y TanStack: lo que instaló la CLI en el scaffold, tal como aparece en `package.json`. No fijar versiones a mano.
- Variables de entorno y puerto: viven exclusivamente en el `.env.example` / `.env` de la raíz del monorepo (territorio del orquestador). El worker reporta variables nuevas y no las escribe.
- Un print, una card: la UI representa prints específicos (nombre + set + variante), no nombres genéricos.
- Los links a tienda son deep-links al producto real; Scryland no gestiona carrito.
- Testing: queda para spec propia.
## Reporte
 
Al terminar una tarea, reporta al orquestador para que registre el avance en `State.md`. El reporte incluye:
 
- Bloque de tarea resuelto.
- Archivos creados o modificados.
- Criterios de aceptación cumplidos y los que no.
- Bloqueos, conflictos con skills o cambios necesarios en `shared/`.