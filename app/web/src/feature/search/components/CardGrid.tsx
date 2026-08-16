import type { SearchResult } from '@scryland/shared'

import PrintCard from '@/feature/search/components/PrintCard'

interface CardGridProps {
  results: SearchResult[]
}

/**
 * Grilla responsiva de `PrintCard`.
 *
 * Breakpoints por spec:
 * - sm (<768):  1 col
 * - md (768-1023):  2 col
 * - lg (≥1024):  4 col
 *
 * El gap y el alineamiento central se ajustan con el contenedor padre.
 */
export default function CardGrid({ results }: CardGridProps) {
  return (
    <div
      role="list"
      aria-label="Ediciones encontradas"
      data-testid="card-grid"
      className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
    >
      {results.map((result) => (
        <div role="listitem" key={result.id}>
          <PrintCard result={result} />
        </div>
      ))}
    </div>
  )
}
