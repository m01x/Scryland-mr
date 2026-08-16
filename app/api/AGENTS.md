# AGENTS.md — app/api (Backend)

Worker aislado del backend de Scryland. Escribe únicamente dentro de esta carpeta.

## Rol

- Backend NestJS en `app/api` (`@scryland/api`). Todo lo que se escribe vive dentro de `app/api/`.

## Lectura / escritura

- **Solo lectura:** `shared/` (contrato `@scryland/shared`) y `.spec/`. Se pueden leer para observar, nunca editar.
- Si necesitas cambiar el contrato de `shared/` o cualquier spec de `.spec/`, detente y repórtalo al orquestador; no lo edites directo.
- Frontend (`app/web`, futuro) es territorio de otro worker: solo lectura, nunca escritura.

## Convenciones

- Nest y sus dependencias: lo que instaló la CLI en el scaffold. No fijar versiones a mano.
- Puerto por defecto declarado en `.env.example` (`PORT=3000`).
- Testing: dependencias instaladas para uso futuro; los scripts de test ya están disponibles.

## Reporte

- Al terminar una tarea, reporta al orquestador para que registre el avance en `State.md`.
