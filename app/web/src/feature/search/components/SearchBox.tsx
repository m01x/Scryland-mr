/**
 * Caja "RESULTADO DE BÚSQUEDA" — display only.
 *
 * Renderiza el contenido decorativo del mockup (ícono de lupa, eyebrow
 * "RESULTADO DE BÚSQUEDA" en Inter tracking-[.14em] uppercase, nombre
 * de la carta en Cinzel/display).
 *
 * NO maneja estado ni handlers: la spec 05 define esta pantalla como
 * maqueteo. La pantalla `SearchPage` recibe el `query` como prop y lo
 * pasa hacia abajo sin mutar nada. A futuro (spec de búsqueda
 * funcional) este componente recibirá un `onSubmit`/`onChange`, no hoy.
 */
interface SearchBoxProps {
  query: string
}

export default function SearchBox({ query }: SearchBoxProps) {
  return (
    <div className="w-full max-w-xl">
      <div className="flex items-center gap-4 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.27_0.034_264/0.85)] px-6 py-5 shadow-[0_8px_32px_oklch(0.13_0.024_262/0.6)] backdrop-blur">
        <SearchIcon />

        <div className="flex flex-col gap-1">
          <span className="font-sans text-xs font-medium uppercase tracking-[.14em] text-[oklch(0.72_0.02_262)]">
            Resultado de búsqueda
          </span>
          <span
            data-testid="search-query"
            className="font-display text-2xl text-[oklch(0.97_0.006_260)]"
          >
            {query}
          </span>
        </div>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="size-6 shrink-0 text-[oklch(0.72_0.02_262)]"
    >
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}
