import { Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface SearchBoxProps {
  query: string
}

/**
 * Caja "RESULTADO DE BÚSQUEDA" — display only.
 *
 * Recreada sobre shadcn: `Card` + `CardContent` como contenedor, `Badge`
 * como eyebrow ("Resultado de búsqueda") y el ícono `Search` de
 * `lucide-react` en lugar de la lupa dibujada a mano. No maneja estado ni
 * handlers (spec 05/06: pantalla de maqueteo).
 */
export default function SearchBox({ query }: SearchBoxProps) {
  return (
    <Card className="w-full max-w-xl rounded-2xl shadow-[0_8px_32px_oklch(0.13_0.024_262/0.6)]">
      <CardContent className="flex items-center gap-4">
        <Search
          aria-hidden="true"
          className="size-6 shrink-0 text-muted-foreground"
        />

        <div className="flex flex-col gap-1.5">
          <Badge
            variant="secondary"
            className="w-fit uppercase tracking-[0.14em] text-muted-foreground"
          >
            Resultado de búsqueda
          </Badge>
          <span data-testid="search-query" className="font-display text-2xl text-foreground">
            {query}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
