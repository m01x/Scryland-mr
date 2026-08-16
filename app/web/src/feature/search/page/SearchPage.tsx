import type { SearchResult } from '@scryland/shared'

import CardGrid from '@/feature/search/components/CardGrid'
import FiltersBar from '@/feature/search/components/FiltersBar'
import HeroNebula from '@/feature/search/components/HeroNebula'
import SearchLogo from '@/feature/search/components/Logo'
import SearchNav from '@/feature/search/components/Nav'
import SearchBox from '@/feature/search/components/SearchBox'

interface SearchPageProps {
  query?: string
  results: SearchResult[]
}

/**
 * Página "Resultado de búsqueda" de Scryland.
 *
 * Composición vertical: hero nebuloso, logo + nav, caja de búsqueda,
 * filtros y grilla de ediciones. Es puramente presentacional: los
 * datos vienen del backend (hoy, del mock `data/mockResults.ts`).
 */
export function SearchPage({
  query = 'Sol Ring',
  results,
}: SearchPageProps) {
  return (
    <main className="relative isolate min-h-svh overflow-hidden">
      <HeroNebula />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col gap-12 px-6 pb-24 pt-10 sm:px-10">
        <header className="flex items-center justify-between">
          <SearchLogo />
          <SearchNav />
        </header>

        <section
          aria-labelledby="search-heading"
          className="flex flex-col items-center gap-8 pt-16 sm:pt-20"
        >
          <h1 id="search-heading" className="sr-only">
            Resultado de búsqueda para {query}
          </h1>
          <SearchBox query={query} />
        </section>

        <section
          aria-label="Filtros y resultados"
          className="flex flex-col gap-6"
        >
          <FiltersBar totalEditions={results.length} />
          <CardGrid results={results} />
        </section>
      </div>
    </main>
  )
}
