/**
 * Punto público de la feature `search`.
 *
 * El router (`src/routes/index.tsx`) importa `SearchRoot` desde aquí
 * para registrar la ruta. La convención del repo es que la feature
 * tenga un solo entrypoint público y que la lógica propia (componente
 * raíz) viva bajo `page/`, no en `routes/`.
 */
export { SearchRoot } from '@/feature/search/page/SearchRoot'
