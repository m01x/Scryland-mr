import { useState } from 'react'
import type { SearchResult, StoreId, StoreOffer } from '@scryland/shared'
import { CircleSlash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import OfferModal from '@/feature/search/components/OfferModal'
import StoreRow, { STORE_IDS } from '@/feature/search/components/StoreRow'
import { formatPrice } from '@/feature/search/components/priceFormat'

interface PrintCardProps {
  result: SearchResult
}

/**
 * Card de un print específico.
 *
 * Cada `SearchResult` (un nombre + set + variante) es una entidad propia
 * — la regla "un print, una card". Recreada sobre shadcn: `Card` con
 * `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`.
 *
 * Desde Spec 11, la card renderiza una fila por cada `StoreId` canónico
 * (derivado de `STORE_IDS`), no solo de `result.offers`: las tiendas sin
 * oferta se fabrican como fila "Próximamente" bloqueada. El arte usa
 * `imageUrl` de la oferta ganadora, con fallback al placeholder. Las filas
 * con stock abren el `OfferModal` de esa tienda.
 */
export default function PrintCard({ result }: PrintCardProps) {
  const isUnavailable = result.offers.every((o) => !o.available)
  const bestPrice = result.bestPrice ?? null
  const bestOffer = winningOffer(result.offers, bestPrice)

  const [activeStore, setActiveStore] = useState<StoreId | null>(null)

  const offerByStore = new Map(result.offers.map((o) => [o.store, o]))
  const activeOffer =
    activeStore === null ? null : (offerByStore.get(activeStore) ?? null)

  return (
    <Card
      data-testid="print-card"
      data-available={isUnavailable ? 'false' : 'true'}
      data-best={bestOffer?.store ?? ''}
      className={
        isUnavailable
          ? 'rounded-2xl pt-0 shadow-[0_8px_30px_oklch(0.13_0.024_262/0.55),inset_0_-60px_60px_-30px_oklch(0.60_0.19_25/0.35)]'
          : 'rounded-2xl pt-0 shadow-[0_8px_30px_oklch(0.13_0.024_262/0.55)]'
      }
    >
      <CardArt imageUrl={bestOffer?.imageUrl} unavailable={isUnavailable} />

      <CardHeader>
        <CardTitle className="font-display text-xl leading-tight text-foreground">
          {result.cardName}
        </CardTitle>
        <CardDescription>{result.editionLabel}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div
          role="table"
          aria-label={`Precios en tiendas para ${result.cardName} (${result.set})`}
          className="flex flex-col gap-1"
        >
          {STORE_IDS.map((storeId) => {
            const offer = offerByStore.get(storeId) ?? null
            return (
              <StoreRow
                key={storeId}
                store={storeId}
                offer={offer}
                isBest={
                  offer !== null &&
                  offer.available &&
                  offer.price !== null &&
                  bestPrice !== null &&
                  offer.price === bestPrice
                }
                onOpen={() => setActiveStore(storeId)}
              />
            )
          })}
        </div>
      </CardContent>

      <CardFooter className="mt-auto">
        <BestPriceCta bestOffer={bestOffer} unavailable={isUnavailable} />
      </CardFooter>

      <OfferModal
        store={activeStore}
        handle={activeOffer?.handle ?? null}
        open={activeStore !== null}
        onOpenChange={(open) => {
          if (!open) setActiveStore(null)
        }}
        cardName={result.cardName}
        editionLabel={result.editionLabel}
        imageUrl={bestOffer?.imageUrl}
      />
    </Card>
  )
}

function CardArt({
  imageUrl,
  unavailable,
}: {
  imageUrl?: string
  unavailable: boolean
}) {
  if (unavailable) {
    return (
      <div
        aria-hidden="true"
        className="relative flex h-44 items-center justify-center overflow-hidden border-b border-border bg-[repeating-linear-gradient(45deg,oklch(0.27_0.034_264/0.85)_0_8px,oklch(0.22_0.03_264/0.85)_8px_16px)]"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <CircleSlash aria-hidden="true" className="size-10" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">
            No disponible
          </span>
        </div>
      </div>
    )
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="arte de la carta"
        loading="lazy"
        className="h-44 w-full border-b border-border object-cover"
      />
    )
  }

  return (
    <div
      aria-label="arte de la carta"
      role="img"
      className="relative flex h-44 items-center justify-center overflow-hidden border-b border-border bg-[repeating-linear-gradient(45deg,oklch(0.27_0.034_264/0.85)_0_8px,oklch(0.22_0.03_264/0.85)_8px_16px)] text-xs uppercase tracking-[0.14em] text-[oklch(0.52_0.02_262)]"
    >
      arte de la carta
    </div>
  )
}

function BestPriceCta({
  bestOffer,
  unavailable,
}: {
  bestOffer: StoreOffer | null
  unavailable: boolean
}) {
  if (unavailable || bestOffer === null) {
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
   * Cuando la mejor oferta es de Paytowin, el CTA usa `variant="accent"` —
   * la fila marcada como "best-price" en verde mint se alinea con el CTA.
   * Esta es la regla explícita de la spec (id canónico `paytowin`).
   */
  const isAccentVariant = bestOffer.store === 'paytowin'

  const priceLabel =
    bestOffer.price !== null
      ? `Ver mejor precio · desde ${formatPrice(bestOffer.price, bestOffer.currency)} →`
      : 'Ver mejor precio →'

  return (
    <Button
      asChild
      variant={isAccentVariant ? 'accent' : 'default'}
      className="w-full"
    >
      <a href={bestOffer.url} target="_blank" rel="noopener noreferrer">
        {priceLabel}
      </a>
    </Button>
  )
}

/** Devuelve la oferta ganadora (disponible y con el mejor precio) o null. */
function winningOffer(
  offers: StoreOffer[],
  bestPrice: number | null,
): StoreOffer | null {
  if (bestPrice === null) return null
  return offers.find((o) => o.available && o.price === bestPrice) ?? null
}
