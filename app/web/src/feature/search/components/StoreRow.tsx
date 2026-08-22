import type { StoreOffer } from '@scryland/shared'

import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/feature/search/components/priceFormat'

interface StoreRowProps {
  offer: StoreOffer
  /** Precio más bajo entre las ofertas de la card. Si coincide, marca la fila. */
  isBest: boolean
}

/**
 * Fila tienda + precio.
 *
 * Tres variantes visuales:
 * - `best`: dot verde mint (accent), precio destacado en un `Badge` verde.
 * - `unavailable`: dot rojo (danger), label tenue, "Sin stock" en un
 *   `Badge` tenue en el slot del precio.
 * - regular: dot cian secundario, precio en un `Badge` neutro.
 *
 * El precio/estado se representa con `Badge` de shadcn; el `StatusDot`
 * queda custom (es un punto de color de 8px, no aporta como badge).
 */
export default function StoreRow({ offer, isBest }: StoreRowProps) {
  if (!offer.available) {
    return (
      <div
        role="row"
        aria-label={`${storeLabel(offer.store)}: sin stock`}
        className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground"
      >
        <span className="flex items-center gap-2">
          <StatusDot tone="danger" />
          <span className="font-medium uppercase tracking-wide text-muted-foreground/70">
            {storeLabel(offer.store)}
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
      <div
        role="row"
        aria-label={`${storeLabel(offer.store)}: mejor precio ${formatPrice(offer.price, offer.currency)}`}
        className="flex items-center justify-between rounded-md bg-[oklch(0.74_0.17_148/0.10)] px-3 py-2 text-sm ring-1 ring-[oklch(0.74_0.17_148/0.45)]"
      >
        <span className="flex items-center gap-2">
          <StatusDot tone="success" />
          <span className="font-semibold uppercase tracking-wide text-foreground">
            {storeLabel(offer.store)}
          </span>
        </span>
        <Badge
          variant="outline"
          className="border-[oklch(0.74_0.17_148/0.45)] bg-[oklch(0.74_0.17_148/0.15)] font-semibold text-[oklch(0.74_0.17_148)]"
        >
          {formatPrice(offer.price, offer.currency)}
        </Badge>
      </div>
    )
  }

  return (
    <div
      role="row"
      aria-label={`${storeLabel(offer.store)}: ${formatPrice(offer.price, offer.currency)}`}
      className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground"
    >
      <span className="flex items-center gap-2">
        <StatusDot tone="cyan" />
        <span className="font-medium uppercase tracking-wide">
          {storeLabel(offer.store)}
        </span>
      </span>
      <Badge variant="secondary" className="font-medium text-foreground">
        {formatPrice(offer.price, offer.currency)}
      </Badge>
    </div>
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

/** Etiqueta de la tienda. El store id llega en lowercase desde mocks; mostramos mayúsculas. */
function storeLabel(id: string): string {
  if (id.toLowerCase() === 'p2w') return 'P2W'
  if (id.toLowerCase() === 'ineko') return 'INEKO'
  if (id.toLowerCase() === 'catlotus') return 'Catlotus'
  return id
}
