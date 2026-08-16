/**
 * Barrel público de la feature `search`.
 *
 * Re-exporta el componente de página y los tipos/mock data. Los
 * componentes granulares (Logo, Nav, HeroNebula, etc.) son detalles de
 * implementación y se importan por path interno cuando hace falta.
 */

export { SearchPage } from '@/feature/search/page/SearchPage'
export { searchResults } from '@/feature/search/data/mockResults'
