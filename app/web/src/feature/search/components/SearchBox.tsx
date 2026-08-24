import { Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface SearchBoxProps {
  query: string
  onQueryChange: (value: string) => void
}

/**
 * Caja "RESULTADO DE BÚSQUEDA" — input controlado.
 *
 * Recreada sobre shadcn: `Card` + `CardContent` como contenedor, `Badge`
 * como eyebrow ("Resultado de búsqueda") y el ícono `Search` de
 * `lucide-react`. El valor lo alimenta el estado `query` de la página
 * (input controlado); cada tecla dispara `onQueryChange`, que actualiza el
 * `useQuery` de la búsqueda real.
 */
export default function SearchBox({ query, onQueryChange }: SearchBoxProps) {
  return (
    <Card className="w-full max-w-xl rounded-2xl shadow-[0_8px_32px_oklch(0.13_0.024_262/0.6)]">
      <CardContent className="flex items-center gap-4">
        <Search
          aria-hidden="true"
          className="size-6 shrink-0 text-muted-foreground"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Badge
            variant="secondary"
            className="w-fit uppercase tracking-[0.14em] text-muted-foreground"
          >
            Resultado de búsqueda
          </Badge>
          <label htmlFor="search-input" className="sr-only">
            Buscar carta
          </label>
          <input
            id="search-input"
            name="q"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar una carta…"
            autoComplete="off"
            spellCheck={false}
            data-testid="search-input"
            className="w-full bg-transparent font-display text-2xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </div>
      </CardContent>
    </Card>
  )
}
