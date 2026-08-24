import { ChevronDown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export type AvailabilityFilter = 'all' | 'available'

interface FiltersBarProps {
  totalEditions: number
  availability: AvailabilityFilter
  onAvailabilityChange: (value: AvailabilityFilter) => void
}

/**
 * FiltersBar — línea de filtros y contador.
 *
 * El filtro "Disponibilidad" ahora opera sobre datos reales: alterna entre
 * "Todas" y "Solo disponibles" (`aria-pressed` sobre el botón) y la página
 * filtra los `results` por `offers.some(o => o.available)`. "Ordenar por"
 * sigue display-only y el contador sigue mostrando el total de ediciones
 * encontradas (sin cambios de alcance).
 */
export default function FiltersBar({
  totalEditions,
  availability,
  onAvailabilityChange,
}: FiltersBarProps) {
  const onlyAvailable = availability === 'available'

  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-card/60 px-5 py-3 sm:flex-row sm:items-center sm:gap-6">
      <div
        role="group"
        aria-label="Filtros de búsqueda"
        className="flex flex-wrap items-center gap-2"
      >
        <Button
          type="button"
          variant="outline"
          aria-pressed={onlyAvailable}
          onClick={() =>
            onAvailabilityChange(onlyAvailable ? 'all' : 'available')
          }
          className="gap-2 rounded-full"
        >
          <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Disponibilidad:
          </span>
          <Badge variant="secondary">
            {onlyAvailable ? 'Solo disponibles' : 'Todas'}
          </Badge>
        </Button>
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
