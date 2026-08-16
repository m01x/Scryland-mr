# AGENTS.md — app/web (Frontend)

Worker aislado del frontend de Scryland. Escribe únicamente dentro de esta carpeta.

## Rol

- Frontend React + TanStack en `app/web` (`@scryland/web`). Todo lo que se escribe vive dentro de `app/web/`.

## Lectura / escritura

- **Solo lectura:** `shared/` (contrato `@scryland/shared`), `.spec/` y `app/api/`. Se pueden leer para observar, nunca editar.
- Si necesitas cambiar el contrato de `shared/` o cualquier spec de `.spec/`, detente y repórtalo al orquestador; no lo edites directo.
- Backend (`app/api`) es territorio de otro worker: solo lectura, nunca escritura.

## Convenciones

- Vite, React y TanStack: lo que instaló la CLI en el scaffold. No fijar versiones a mano.
- Puerto de dev declarado en `.env.example` (`WEB_PORT=5173`).
- Testing: queda para spec propia.

## Reporte

- Al terminar una tarea, reporta al orquestador para que registre el avance en `State.md`.
