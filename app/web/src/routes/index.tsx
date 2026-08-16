import { createFileRoute } from '@tanstack/react-router'

import { SearchRoot } from '@/feature/search/page'

/**
 * Ruta raíz (`/`): pantalla "Resultado de búsqueda".
 *
 * Esta capa es **delegación pura**. TanStack Router (file-based) exige
 * que el archivo declarado bajo `src/routes/` declare su `Route` con
 * `createFileRoute` — el motor del plugin no sigue re-exports
 * `export { X } from '...'` en su generador actual. Para conservar
 * markup fuera del router:
 *
 *   1. Este archivo solo expone `Route` con la firma TanStack.
 *   2. El componente (`SearchRoot`) y todo el markup de la página
 *      viven en la feature `search/`.
 *   3. La convención "el router nunca contiene markup propio" se
 *      preserva: este archivo no declara JSX directamente, solo
 *      referencia el componente delegado.
 *
 * Ver `app/web/AGENTS.md` ("Arquitectura de features") y la spec 05.
 */
export const Route = createFileRoute('/')({
  component: SearchRoot,
})
