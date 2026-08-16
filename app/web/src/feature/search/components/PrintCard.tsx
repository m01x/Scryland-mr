import type { SearchResult, StoreOffer } from '@scryland/shared'

import { Button } from '@/components/ui/button'
import StoreRow from '@/feature/search/components/StoreRow'
import { formatPrice } from '@/feature/search/components/priceFormat'

interface PrintCardProps {
  result: SearchResult
}

/**
 * Card de un print específico.
 *
 * Cada `SearchResult` (un nombre + set + variante) es una entidad
 * propia — esta es la regla "un print, una card". Cuando no hay stock
 * en ninguna tienda, la card se renderiza en su variante `unavailable`:
 * la imagen cambia a un placeholder tachado, los StoreRows muestran
 * "Sin stock", el CTA queda deshabilitado y la card gana un glow rojo
 * sutil inferior como pista visual.
 */
export default function PrintCard({ result }: PrintCardProps) {
  const isUnavailable = result.offers.every((o) => !o.available)
  const bestPrice = result.bestPrice ?? null
  const bestStoreName = bestStoreOf(result.offers, bestPrice)

  return (
    <article
      data-testid="print-card"
      data-available={isUnavailable ? 'false' : 'true'}
      data-best={bestStoreName ?? ''}
      className={
        isUnavailable
          ? 'group relative flex flex-col overflow-hidden rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.22_0.03_264/0.85)] shadow-[0_8px_30px_oklch(0.13_0.024_262/0.55),inset_0_-60px_60px_-30px_oklch(0.60_0.19_25/0.35)]'
          : 'group relative flex flex-col overflow-hidden rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.22_0.03_264/0.85)] shadow-[0_8px_30px_oklch(0.13_0.024_262/0.55)]'
      }
    >
      <CardArtPlaceholder unavailable={isUnavailable} />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <header className="flex flex-col gap-1">
          <h3 className="font-display text-xl leading-tight text-[oklch(0.97_0.006_260)]">
            {result.cardName}
          </h3>
          <p className="text-sm text-[oklch(0.72_0.02_262)]">
            {result.editionLabel}
          </p>
        </header>

        <div
          role="table"
          aria-label={`Precios en tiendas para ${result.cardName} (${result.set})`}
          className="flex flex-col gap-1"
        >
          {result.offers.map((offer) => (
            <StoreRow
              key={offer.store}
              offer={offer}
              isBest={
                offer.available &&
                offer.price !== null &&
                bestPrice !== null &&
                offer.price === bestPrice
              }
            />
          ))}
        </div>

        <div className="mt-auto pt-3">
          <BestPriceCta
            price={bestPrice}
            currency={result.offers[0]?.currency ?? 'CLP'}
            bestStore={bestStoreName}
            unavailable={isUnavailable}
          />
        </div>
      </div>
    </article>
  )
}

function CardArtPlaceholder({ unavailable }: { unavailable: boolean }) {
  if (unavailable) {
    return (
      <div
        aria-hidden="true"
        className="relative flex h-44 items-center justify-center overflow-hidden border-b border-[oklch(1_0_0/0.06)] bg-[repeating-linear-gradient(45deg,oklch(0.27_0.034_264/0.85)_0_8px,oklch(0.22_0.03_264/0.85)_8px_16px)]"
      >
        <div className="flex flex-col items-center gap-2 text-[oklch(0.72_0.02_262)]">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            className="size-10"
            aria-hidden="true"
          >
            <circle cx={16} cy={16} r={11} />
            <path d="m6 6 20 20" strokeLinecap="round" />
          </svg>
          <span className="font-sans text-xs font-semibold uppercase tracking-[.14em]">
            No disponible
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      aria-label="arte de la carta"
      role="img"
      className="relative flex h-44 items-center justify-center overflow-hidden border-b border-[oklch(1_0_0/0.06)] bg-[repeating-linear-gradient(45deg,oklch(0.27_0.034_264/0.85)_0_8px,oklch(0.22_0.03_264/0.85)_8px_16px)] text-xs uppercase tracking-[.14em] text-[oklch(0.52_0.02_262)]"
    >
      arte de la carta
    </div>
  )
}

function BestPriceCta({
  price,
  currency,
  bestStore,
  unavailable,
}: {
  price: number | null
  currency: string
  bestStore: string | null
  unavailable: boolean
}) {
  if (unavailable) {
    return (
      <Button
        type="button"
        disabled
        variant="default"
        className="w-full"
      >
        Ver mejor precio →
      </Button>
    )
  }

  /**
   * La card 2 (Revised Edition con P2W como best) usa variant="accent"
   * — la fila marcada como "best-price" en verde mint se alinea con el
   * CTA. Esta es la regla explícita de la spec.
   */
  const isAccentVariant = bestStore?.toLowerCase() === 'p2w'

  return (
    <Button
      type="button"
      variant={isAccentVariant ? 'accent' : 'default'}
      className="w-full"
    >
      {price !== null
        ? `Ver mejor precio · ${formatPrice(price, currency)} →`
        : 'Ver mejor precio →'}
    </Button>
  )
}

/** Devuelve el `store` de la oferta con el mejor precio, o null. */
function bestStoreOf(
  offers: StoreOffer[],
  bestPrice: number | null,
): string | null {
  if (bestPrice === null) return null
  const winner = offers.find(
    (o) => o.available && o.price === bestPrice,
  )
  return winner?.store ?? null
}
