import type { StoreId, StoreOffer } from '@scryland/shared'

import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/feature/search/components/priceFormat'

interface StoreRowProps {
  offer: StoreOffer
  /** Precio más bajo entre las ofertas de la card. Si coincide, marca la fila. */
  isBest: boolean
}

/** Etiqueta de tienda por id canónico (`StoreId`). */
const STORE_LABELS: Record<StoreId, string> = {
  ineko: 'INEKO',
  paytowin: 'Paytowin',
  catlotus: 'Catlotus',
}

/**
 * Fila tienda + precio.
 *
 * Tres variantes visuales:
 * - `best`: dot verde mint (accent), precio destacado en un `Badge` verde,
 *   rotulado "desde $X" (el `price` es el mínimo entre variantes).
 * - `unavailable`: dot rojo (danger), label tenue, "Sin stock" en un
 *   `Badge` tenue en el slot del precio (sin link).
 * - regular: dot cian secundario, precio en un `Badge` neutro.
 *
 * Las filas disponibles enlazan al deep-link real (`offer.url`) en una
 * pestaña nueva (`target="_blank"`, `rel="noopener noreferrer"`).
 */
export default function StoreRow({ offer, isBest }: StoreRowProps) {
  const label = STORE_LABELS[offer.store]

  if (!offer.available) {
    return (
      <div
        role="row"
        aria-label={`${label}: sin stock`}
        className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground"
      >
        <span className="flex items-center gap-2">
          <StatusDot tone="danger" />
          <span className="font-medium uppercase tracking-wide text-muted-foreground/70">
            {label}
          </span>
        </span>
        <Badge variant="outline" className="text-muted-foreground">
          Sin stock
        </Badge>
      </div>
    )
  }

  if (isBest) {
    return (
      <a
        href={offer.url}
        target="_blank"
        rel="noopener noreferrer"
        role="row"
        aria-label={`${label}: mejor precio desde ${formatPrice(offer.price, offer.currency)}`}
        className="flex items-center justify-between rounded-md bg-[oklch(0.74_0.17_148/0.10)] px-3 py-2 text-sm ring-1 ring-[oklch(0.74_0.17_148/0.45)] transition-colors hover:bg-[oklch(0.74_0.17_148/0.16)]"
      >
        <span className="flex items-center gap-2">
          <StatusDot tone="success" />
          <span className="font-semibold uppercase tracking-wide text-foreground">
            {label}
          </span>
        </span>
        <Badge
          variant="outline"
          className="border-[oklch(0.74_0.17_148/0.45)] bg-[oklch(0.74_0.17_148/0.15)] font-semibold text-[oklch(0.74_0.17_148)]"
        >
          desde {formatPrice(offer.price, offer.currency)}
        </Badge>
      </a>
    )
  }

  return (
    <a
      href={offer.url}
      target="_blank"
      rel="noopener noreferrer"
      role="row"
      aria-label={`${label}: ${formatPrice(offer.price, offer.currency)}`}
      className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
    >
      <span className="flex items-center gap-2">
        <StatusDot tone="cyan" />
        <span className="font-medium uppercase tracking-wide">{label}</span>
      </span>
      <Badge variant="secondary" className="font-medium text-foreground">
        {formatPrice(offer.price, offer.currency)}
      </Badge>
    </a>
  )
}

function StatusDot({ tone }: { tone: 'success' | 'cyan' | 'danger' }) {
  const toneClass =
    tone === 'success'
      ? 'bg-[oklch(0.74_0.17_148)] shadow-[0_0_8px_oklch(0.74_0.17_148/0.55)]'
      : tone === 'cyan'
        ? 'bg-[oklch(0.78_0.13_202)] shadow-[0_0_6px_oklch(0.78_0.13_202/0.45)]'
        : 'bg-[oklch(0.60_0.19_25)] shadow-[0_0_6px_oklch(0.60_0.19_25/0.45)]'

  return (
    <span
      aria-hidden="true"
      className={`size-2 rounded-full ${toneClass}`}
    />
  )
}
