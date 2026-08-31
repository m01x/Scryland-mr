import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import type { OfferDetailResponse, OfferVariant, StoreId } from '@scryland/shared'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchOfferDetail } from '@/feature/search/data/offer'
import { formatPrice } from '@/feature/search/components/priceFormat'
import { STORE_LABELS } from '@/feature/search/components/StoreRow'

/** El detalle de un producto es estable: no refetchear por 30 min. */
const OFFER_STALE_TIME_MS = 30 * 60 * 1000

interface OfferModalProps {
  store: StoreId | null
  handle: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Nombre de la carta (del `SearchResult`), mostrado como título del modal. */
  cardName: string
  /** Edición del print (del `SearchResult`), mostrada como descripción. */
  editionLabel: string
  /** Imagen del print (imagen de la oferta ganadora de la card). */
  imageUrl?: string
}

/**
 * Modal de detalle por tienda (Spec 11).
 *
 * Carga `GET /api/offers/:store/:handle` bajo demanda: el `useQuery` tiene
 * `enabled` solo con el modal abierto y una `staleTime` alta. Muestra la
 * carta (nombre + edición) y la imagen del print a la izquierda, con el
 * listado de variantes (disponibles por defecto, toggle "Ver todas (N)")
 * a la derecha, o degrada a aviso + enlace directo a `productUrl`.
 *
 * Estructura: en desktop (`sm+`) dos columnas (imagen fija a la izquierda,
 * descripción + variantes con scroll interno a la derecha); en mobile
 * apilado con el scroll del propio modal.
 */
export default function OfferModal({
  store,
  handle,
  open,
  onOpenChange,
  cardName,
  editionLabel,
  imageUrl,
}: OfferModalProps) {
  const detailQuery = useQuery({
    queryKey: ['offer', store, handle],
    queryFn: () => {
      if (store === null || handle === null) {
        return Promise.reject(new Error('Offer detail requires store and handle'))
      }
      return fetchOfferDetail(store, handle)
    },
    enabled: open && store !== null && handle !== null,
    staleTime: OFFER_STALE_TIME_MS,
  })

  const label = store === null ? '' : STORE_LABELS[store]
  // Primaria: imagen de la card (del `SearchResult`); fallback: la del detalle.
  const resolvedImageUrl = imageUrl ?? detailQuery.data?.imageUrl

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80svh] max-w-lg overflow-y-auto sm:max-w-2xl sm:overflow-hidden">
        <div className="grid gap-4 sm:grid-cols-[2fr_3fr] sm:gap-5">
          <OfferImage imageUrl={resolvedImageUrl} label={label} />

          {/* Columna derecha: descripción + variantes, scroll interno en desktop.
              `calc(80svh - 3rem)` descuenta el `p-6` del `DialogContent`. */}
          <div className="flex min-h-0 flex-col gap-4 sm:max-h-[calc(80svh-3rem)] sm:overflow-y-auto sm:pr-1">
            <DialogHeader className="text-left">
              <div className="flex items-start justify-between gap-2">
                <DialogTitle className="min-w-0 text-xl leading-tight">
                  {cardName}
                </DialogTitle>
                <Badge variant="outline" className="mt-0.5 shrink-0">
                  {label}
                </Badge>
              </div>
              <DialogDescription>{editionLabel}</DialogDescription>
            </DialogHeader>

            {store === null || handle === null ? null : detailQuery.isPending ? (
              <OfferLoadingState />
            ) : detailQuery.isError ? (
              <OfferErrorState onRetry={() => detailQuery.refetch()} />
            ) : detailQuery.data ? (
              <OfferSuccessState data={detailQuery.data} store={store} />
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function OfferLoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="offer-loading"
      className="flex flex-col items-center gap-3 py-8 text-muted-foreground"
    >
      <Loader2 aria-hidden="true" className="size-6 animate-spin" />
      <p className="text-sm">Cargando variantes…</p>
    </div>
  )
}

function OfferErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      data-testid="offer-error"
      className="flex flex-col items-center gap-3 py-8 text-center"
    >
      <p className="text-sm text-muted-foreground">
        No pudimos cargar las variantes de esta tienda.
      </p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}

function OfferSuccessState({
  data,
  store,
}: {
  data: OfferDetailResponse
  store: StoreId
}) {
  const label = STORE_LABELS[store]

  if (data.variants.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          No se recibieron detalles desde el proveedor.
        </p>
        <Button asChild variant="accent" className="w-full">
          <a href={data.productUrl} target="_blank" rel="noopener noreferrer">
            Ver en {label} →
          </a>
        </Button>
      </div>
    )
  }

  return <VariantList variants={data.variants} />
}

function OfferImage({ imageUrl, label }: { imageUrl?: string; label: string }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`Arte de la carta — ${label}`}
        className="aspect-[5/7] w-full rounded-xl border border-border object-cover"
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className="flex aspect-[5/7] w-full items-center justify-center rounded-xl border border-border bg-[repeating-linear-gradient(45deg,oklch(0.27_0.034_264/0.85)_0_8px,oklch(0.22_0.03_264/0.85)_8px_16px)] text-xs uppercase tracking-[0.14em] text-[oklch(0.52_0.02_262)]"
    >
      Sin imagen
    </div>
  )
}

function VariantList({ variants }: { variants: OfferVariant[] }) {
  const [showAll, setShowAll] = useState(false)

  const sorted = sortVariantsByPrice(variants)
  const soldOutCount = sorted.filter((v) => !v.available).length
  const visible = showAll ? sorted : sorted.filter((v) => v.available)

  return (
    <div className="flex flex-col gap-3">
      <ol data-testid="offer-variants" className="flex flex-col gap-1">
        {visible.map((variant) => (
          <VariantRow key={variant.url} variant={variant} />
        ))}
      </ol>

      {soldOutCount > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAll((prev) => !prev)}
          className="self-start"
        >
          {showAll ? 'Ver solo disponibles' : `Ver todas (${sorted.length})`}
        </Button>
      ) : null}
    </div>
  )
}

function VariantRow({ variant }: { variant: OfferVariant }) {
  const isSoldOut = !variant.available

  return (
    <li className={isSoldOut ? 'opacity-50' : undefined}>
      <a
        href={variant.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/50"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Badge variant="outline" className="shrink-0">
            {variant.condition ?? '—'}
          </Badge>
          {variant.finish === 'foil' ? (
            <Badge variant="secondary" className="shrink-0">
              Foil
            </Badge>
          ) : variant.finish === 'normal' ? (
            <Badge variant="secondary" className="shrink-0">
              Normal
            </Badge>
          ) : null}
          <span className="truncate text-xs uppercase tracking-wide text-muted-foreground">
            {variant.language ?? '—'}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {isSoldOut ? (
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Agotada
            </span>
          ) : null}
          <span className="font-semibold text-foreground">
            {formatPrice(variant.price, 'CLP')}
          </span>
        </span>
      </a>
    </li>
  )
}

/** Orden por precio ascendente; las variantes sin precio (`null`) van al final. */
function sortVariantsByPrice(variants: OfferVariant[]): OfferVariant[] {
  return variants.toSorted((a, b) => {
    if (a.price === null && b.price === null) return 0
    if (a.price === null) return 1
    if (b.price === null) return -1
    return a.price - b.price
  })
}
