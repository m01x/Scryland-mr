/**
 * Tiendas objetivo de la v1 del comparador.
 *
 * Solo identidad por ahora: los endpoints/URLs de consulta y el scraping se
 * agregan en una spec futura (esta spec deja únicamente el esqueleto del
 * módulo de tiendas).
 */
export const TARGET_STORES = {
  ineko: {
    id: 'ineko',
    name: 'Ineko',
  },
  paytowin: {
    id: 'paytowin',
    name: 'Paytowin',
  },
} as const;

export type TargetStoreId = keyof typeof TARGET_STORES;
export type TargetStoreName = (typeof TARGET_STORES)[TargetStoreId]['name'];
