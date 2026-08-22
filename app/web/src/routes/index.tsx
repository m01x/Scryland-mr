import { createFileRoute } from '@tanstack/react-router'

import { SearchPage } from '@/feature/search/page/SearchPage'

/**
 * Ruta raíz (`/`): pantalla "Resultado de búsqueda".
 *
 * Esta capa es **delegación pura**: el archivo solo expone `Route` con
 * la firma de TanStack Router (`createFileRoute('/')({ component })`) y
 * no declara JSX propio. Todo el markup vive en la feature `search/`,
 * en `SearchPage` (`@/feature/search/page/SearchPage`), que es
 * autocontenido (inyecta sus propios datos sin props ni wrappers).
 *
 * Ver `app/web/AGENTS.md` ("Arquitectura de features").
 */
export const Route = createFileRoute('/')({
  component: SearchPage,
})
