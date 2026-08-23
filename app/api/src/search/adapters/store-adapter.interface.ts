import type { StoreOffer } from '@scryland/shared';

/**
 * Oferta normalizada que produce un adapter de tienda. Lleva la identidad del
 * print (`printKey`, `cardName`, `set`, `editionLabel`) más la oferta ya
 * convertida al contrato `StoreOffer`. El `SearchService` agrupa por `printKey`.
 */
export interface NormalizedOffer {
  printKey: string;
  cardName: string;
  set: string;
  editionLabel: string;
  offer: StoreOffer;
}

/**
 * Contrato de un adapter de tienda: dada una query, devuelve las ofertas
 * normalizadas de esa tienda (o lista vacía si no hay/falla el mapeo). Cada
 * tienda se consulta una sola vez por query.
 */
export interface StoreAdapter {
  search(query: string): Promise<NormalizedOffer[]>;
}

/** Token de inyección que reúne todos los adapters (fan-out del `SearchService`). */
export const STORE_ADAPTERS = Symbol('STORE_ADAPTERS');
