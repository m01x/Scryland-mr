import { CircleSlash, Loader2, SearchX } from 'lucide-react'

import { Button } from '@/components/ui/button'

/**
 * Estados de la búsqueda real: `loading`, `error`, vacío (sin resultados),
 * idle (query demasiado corta para disparar el fetch) y "sin disponibles"
 * (hay resultados, pero ninguno con stock tras el filtro).
 *
 * Cada estado es `role="status"`/`role="alert"` con `data-testid` para ser
 * observable en tests y anunciado por lectores de pantalla.
 */

export function IdleState() {
  return (
    <p
      role="status"
      data-testid="search-idle"
      className="py-12 text-center text-muted-foreground"
    >
      Escribe al menos 2 caracteres para buscar una carta.
    </p>
  )
}

export function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="search-loading"
      className="flex flex-col items-center gap-3 py-12 text-muted-foreground"
    >
      <Loader2 aria-hidden="true" className="size-8 animate-spin" />
      <p>Buscando…</p>
    </div>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      data-testid="search-error"
      className="flex flex-col items-center gap-3 py-12 text-center"
    >
      <p className="text-muted-foreground">
        No pudimos conectar con el servidor de búsqueda.
      </p>
      <Button type="button" variant="outline" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}

export function EmptyState({ query }: { query: string }) {
  return (
    <div
      role="status"
      data-testid="search-empty"
      className="flex flex-col items-center gap-3 py-12 text-center"
    >
      <SearchX aria-hidden="true" className="size-8 text-muted-foreground" />
      <p className="text-muted-foreground">
        No se encontraron resultados para{' '}
        <span className="font-semibold text-foreground">{query}</span>.
      </p>
    </div>
  )
}

export function NoAvailableState() {
  return (
    <div
      role="status"
      data-testid="search-no-available"
      className="flex flex-col items-center gap-3 py-12 text-center"
    >
      <CircleSlash aria-hidden="true" className="size-8 text-muted-foreground" />
      <p className="text-muted-foreground">
        Ninguna de las ediciones encontradas tiene stock disponible.
      </p>
    </div>
  )
}
