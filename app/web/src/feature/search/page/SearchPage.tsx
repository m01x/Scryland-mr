import CardGrid from '@/feature/search/components/CardGrid'
import FiltersBar from '@/feature/search/components/FiltersBar'
import HeroNebula from '@/feature/search/components/HeroNebula'
import SearchLogo from '@/feature/search/components/Logo'
import SearchNav from '@/feature/search/components/Nav'
import SearchBox from '@/feature/search/components/SearchBox'
import { searchResults } from '@/feature/search/data/mockResults'

const QUERY = 'Sol Ring'

/**
 * Página "Resultado de búsqueda" de Scryland.
 *
 * Composición vertical: hero nebuloso, logo + nav, caja de búsqueda,
 * filtros y grilla de ediciones. Es puramente presentacional y
 * autocontenida: inyecta `searchResults` directo desde el mock (sin
 * props ni wrapper), de modo que `routes/index.tsx` la registra como
 * delegación pura. Cuando el backend exponga `GET /api/search`, los
 * datos pasan a `useQuery`/loader sin tocar la forma de la feature.
 */
export function SearchPage() {
  return (
    <main className="relative isolate min-h-svh overflow-hidden">
      <HeroNebula />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col gap-12 px-6 pb-24 pt-5 sm:px-10">
        <header className="flex items-center justify-between">
          <SearchLogo />
          <SearchNav />
        </header>

        <section
          aria-labelledby="search-heading"
          className="flex flex-col items-center gap-8 pt-10 sm:pt-10"
        >
          <h1 id="search-heading" className="sr-only">
            Resultado de búsqueda para {QUERY}
          </h1>
          <SearchBox query={QUERY} />
        </section>

        <section
          aria-label="Filtros y resultados"
          className="flex flex-col gap-6"
        >
          <FiltersBar totalEditions={searchResults.length} />
          <CardGrid results={searchResults} />
        </section>
      </div>
    </main>
  )
}
