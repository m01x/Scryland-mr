import { useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'

import CardGrid from '@/feature/search/components/CardGrid'
import FiltersBar from '@/feature/search/components/FiltersBar'
import type { AvailabilityFilter } from '@/feature/search/components/FiltersBar'
import HeroNebula from '@/feature/search/components/HeroNebula'
import SearchLogo from '@/feature/search/components/Logo'
import SearchNav from '@/feature/search/components/Nav'
import {
  EmptyState,
  ErrorState,
  IdleState,
  LoadingState,
  NoAvailableState,
} from '@/feature/search/components/ResultsStates'
import SearchBox from '@/feature/search/components/SearchBox'
import { fetchSearch } from '@/feature/search/data/search'

/** El backend cachea por query (TTL 5 min): no refetchear encima. */
const SEARCH_STALE_TIME_MS = 5 * 60 * 1000
/** Coherente con el `@MinLength(2)` del DTO del backend. */
const MIN_QUERY_LENGTH = 2

/**
 * Página "Resultado de búsqueda" de Scryland.
 *
 * Composición vertical: hero nebuloso, logo + nav, caja de búsqueda
 * (input controlado), filtros y grilla de ediciones. La búsqueda consume
 * `GET /api/search` vía `useQuery` (key `['search', query]`), con `enabled`
 * solo a partir de 2 caracteres y `staleTime` alto. Los estados
 * `loading`/`error`/vacío reemplazan al maqueteo anterior.
 */
export function SearchPage() {
  const [query, setQuery] = useState('')
  const [availability, setAvailability] = useState<AvailabilityFilter>('all')

  const trimmedQuery = query.trim()
  const hasQuery = trimmedQuery.length >= MIN_QUERY_LENGTH

  const searchQuery = useQuery({
    queryKey: ['search', trimmedQuery],
    queryFn: () => fetchSearch(trimmedQuery),
    enabled: hasQuery,
    staleTime: SEARCH_STALE_TIME_MS,
  })

  const results = searchQuery.data?.results ?? []

  const visibleResults =
    availability === 'available'
      ? results.filter((result) =>
          result.offers.some((offer) => offer.available),
        )
      : results

  const isLoading =
    hasQuery && searchQuery.isFetching && searchQuery.data === undefined

  let content: ReactNode

  if (!hasQuery) {
    content = <IdleState />
  } else if (isLoading) {
    content = <LoadingState />
  } else if (searchQuery.isError) {
    content = <ErrorState onRetry={() => searchQuery.refetch()} />
  } else if (results.length === 0) {
    content = <EmptyState query={trimmedQuery} />
  } else {
    content = (
      <>
        <FiltersBar
          totalEditions={results.length}
          availability={availability}
          onAvailabilityChange={setAvailability}
        />
        {visibleResults.length === 0 ? (
          <NoAvailableState />
        ) : (
          <CardGrid results={visibleResults} />
        )}
      </>
    )
  }

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
            Resultado de búsqueda
          </h1>
          <SearchBox query={query} onQueryChange={setQuery} />
        </section>

        <section
          aria-label="Filtros y resultados"
          className="flex flex-col gap-6"
        >
          {content}
        </section>
      </div>
    </main>
  )
}
