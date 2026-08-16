/**
 * FiltersBar — línea de filtros y contador.
 *
 * Presenta dos "filtros" visuales (Disponibilidad, Ordenar por) y un
 * contador de resultados. En esta spec son display: no mutan estado ni
 * disparan handlers. La spec 05 define esta pantalla como maqueteo.
 *
 * Los dos grupos de la izquierda están envueltos en un contenedor con
 * `role="group"` para accesibilidad, aunque el control real vendrá en
 * la spec de búsqueda funcional.
 */
interface FiltersBarProps {
  totalEditions: number
}

export default function FiltersBar({ totalEditions }: FiltersBarProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.22_0.03_264/0.55)] px-5 py-3 sm:flex-row sm:items-center sm:gap-6">
      <div
        role="group"
        aria-label="Filtros de búsqueda"
        className="flex flex-wrap items-center gap-2"
      >
        <FilterPill label="Disponibilidad:" value="Todas" />
        <FilterPill label="Ordenar por:" value="Precio más bajo" />
      </div>

      <p
        role="status"
        aria-live="polite"
        className="text-sm text-[oklch(0.72_0.02_262)]"
      >
        <span data-testid="editions-count">{totalEditions}</span>{' '}
        {totalEditions === 1
          ? 'edición encontrada'
          : 'ediciones encontradas'}
      </p>
    </div>
  )
}

function FilterPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[oklch(1_0_0/0.08)] bg-[oklch(0.13_0.024_262/0.55)] px-3 py-1.5">
      <span className="text-xs uppercase tracking-[.14em] text-[oklch(0.52_0.02_262)]">
        {label}
      </span>
      <span className="text-sm font-medium text-[oklch(0.97_0.006_260)]">
        {value}
      </span>
      <span aria-hidden="true" className="text-[oklch(0.72_0.02_262)]">
        ▾
      </span>
    </div>
  )
}
