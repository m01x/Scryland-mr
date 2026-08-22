import { ChevronDown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface FiltersBarProps {
  totalEditions: number
}

/**
 * FiltersBar — línea de filtros y contador.
 *
 * Recreada sobre shadcn: cada filtro visual es un `Button` `outline` con
 * su valor actual en un `Badge` y el `ChevronDown` de `lucide-react` en
 * lugar del "▾" a mano. Siguen siendo display-only: no mutan estado ni
 * disparan handlers (la búsqueda funcional es una spec futura).
 */
export default function FiltersBar({ totalEditions }: FiltersBarProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-card/60 px-5 py-3 sm:flex-row sm:items-center sm:gap-6">
      <div
        role="group"
        aria-label="Filtros de búsqueda"
        className="flex flex-wrap items-center gap-2"
      >
        <FilterButton label="Disponibilidad:" value="Todas" />
        <FilterButton label="Ordenar por:" value="Precio más bajo" />
      </div>

      <p
        role="status"
        aria-live="polite"
        className="text-sm text-muted-foreground"
      >
        <span data-testid="editions-count">{totalEditions}</span>{' '}
        {totalEditions === 1
          ? 'edición encontrada'
          : 'ediciones encontradas'}
      </p>
    </div>
  )
}

function FilterButton({ label, value }: { label: string; value: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2 rounded-full"
    >
      <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <Badge variant="secondary">{value}</Badge>
      <ChevronDown aria-hidden="true" className="size-3.5" />
    </Button>
  )
}
