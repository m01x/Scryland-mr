import type { StoreId, StoreOffer } from '@scryland/shared'

import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/feature/search/components/priceFormat'

export const STORE_LABELS: Record<StoreId, string> = {
  ineko: 'INEKO',
  paytowin: 'Paytowin',
  catlotus: 'Catlotus',
}

/** Lista canónica de tiendas, en el orden de presentación de la card. */
export const STORE_IDS = Object.keys(STORE_LABELS) as StoreId[]

interface StoreRowProps {
  store: StoreId
  /** `null` cuando la tienda no devolvió el print (filas faltantes, 4.4). */
  offer: StoreOffer | null
  /** Precio más bajo entre las ofertas de la card. Si coincide, marca la fila. */
  isBest: boolean
  /** Abre el modal de detalle de esta tienda (solo filas con stock). */
  onOpen: () => void
}

/**
 * Fila tienda + precio.
 *
 * Estados por fila (Spec 11, 4.5):
 * - con stock → "desde $X" en un `<button>` que abre el modal de la tienda.
 * - sin stock → "Sin stock en `<tienda>`" en un `<div>` bloqueado (sin handler).
 * - sin oferta (catlotus) → "Próximamente" en un `<div>` bloqueado (sin handler).
 *
 * Las filas bloqueadas no son interactivas: se renderizan como `<div>`/`<span>`
 * sin `onClick` ni `<button>`, para que un click no abra modal ni dispare
 * request a `/api/offers`.
 */
export default function StoreRow({
  store,
  offer,
  isBest,
  onOpen,
}: StoreRowProps) {
  const label = STORE_LABELS[store]

  if (offer === null) {
    return (
      <div
        role="row"
        aria-label={`${label}: próximamente`}
        className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground"
      >
        <span className="flex items-center gap-2">
          <StatusDot tone="muted" />
          <span className="font-medium uppercase tracking-wide text-muted-foreground/70">
            {label}
          </span>
        </span>
        <Badge variant="outline" className="text-muted-foreground">
          Próximamente
        </Badge>
      </div>
    )
  }

  if (!offer.available) {
    return (
      <div
        role="row"
        aria-label={`Sin stock en ${label}`}
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
      <button
        type="button"
        onClick={onOpen}
        role="row"
        aria-label={`${label}: mejor precio desde ${formatPrice(offer.price, offer.currency)}`}
        className="flex w-full cursor-pointer items-center justify-between rounded-md bg-[oklch(0.74_0.17_148/0.10)] px-3 py-2 text-left text-sm ring-1 ring-[oklch(0.74_0.17_148/0.45)] transition-colors hover:bg-[oklch(0.74_0.17_148/0.16)]"
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
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      role="row"
      aria-label={`${label}: desde ${formatPrice(offer.price, offer.currency)}`}
      className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
    >
      <span className="flex items-center gap-2">
        <StatusDot tone="cyan" />
        <span className="font-medium uppercase tracking-wide">{label}</span>
      </span>
      <Badge variant="secondary" className="font-medium text-foreground">
        desde {formatPrice(offer.price, offer.currency)}
      </Badge>
    </button>
  )
}

function StatusDot({
  tone,
}: {
  tone: 'success' | 'cyan' | 'danger' | 'muted'
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-[oklch(0.74_0.17_148)] shadow-[0_0_8px_oklch(0.74_0.17_148/0.55)]'
      : tone === 'cyan'
        ? 'bg-[oklch(0.78_0.13_202)] shadow-[0_0_6px_oklch(0.78_0.13_202/0.45)]'
        : tone === 'danger'
          ? 'bg-[oklch(0.60_0.19_25)] shadow-[0_0_6px_oklch(0.60_0.19_25/0.45)]'
          : 'bg-[oklch(0.52_0.02_262)] shadow-[0_0_6px_oklch(0.52_0.02_262/0.4)]'

  return (
    <span
      aria-hidden="true"
      className={`size-2 rounded-full ${toneClass}`}
    />
  )
}
