import type { OfferDetailResponse, StoreId } from '@scryland/shared';

/**
 * Contrato de un adapter de detalle de tienda: dado un `handle`, devuelve el
 * detalle normalizado de variantes. Solo ineko/paytowin lo implementan
 * (catlotus no tiene scraping y por tanto no expone detalle).
 */
export interface DetailAdapter {
  readonly storeId: StoreId;
  getDetail(handle: string): Promise<OfferDetailResponse>;
}

/** Token de inyección que reúne todos los adapters de detalle. */
export const DETAIL_ADAPTERS = Symbol('DETAIL_ADAPTERS');
