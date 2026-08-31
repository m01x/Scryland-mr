import type { OfferDetailResponse, StoreId } from '@scryland/shared'

const OFFER_ENDPOINT = '/api/offers'

/**
 * Consulta `GET /api/offers/:store/:handle` del backend (vía proxy de Vite
 * en dev) y devuelve la respuesta tipada con `OfferDetailResponse`.
 *
 * A diferencia de la búsqueda, este detalle se pide bajo demanda al abrir
 * el modal de una tienda concreta (Spec 11). Lanza si la red falla o la
 * respuesta no es exitosa, para que `useQuery` lo capture como `error`.
 */
export async function fetchOfferDetail(
  store: StoreId,
  handle: string,
): Promise<OfferDetailResponse> {
  const url = `${OFFER_ENDPOINT}/${encodeURIComponent(store)}/${encodeURIComponent(handle)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Offer detail request failed with status ${response.status}`)
  }

  return (await response.json()) as OfferDetailResponse
}
