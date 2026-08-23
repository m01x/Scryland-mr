/**
 * Tiendas objetivo de la v1 del comparador.
 *
 * Identidad + endpoint de sugerencias Shopify (`/search/suggest.json`), que es
 * la única fuente de consulta por query (da `title`, `price`, `available`,
 * `handle` e `image` juntos). Catlotus no tiene URL real todavía: queda como
 * stub (ver `CatlotusAdapter`).
 */
export const SUGGEST_ENDPOINT_PATH = '/search/suggest.json';

export const TARGET_STORES = {
  ineko: {
    id: 'ineko',
    name: 'Ineko',
    baseUrl: 'https://inekosingles.com',
  },
  paytowin: {
    id: 'paytowin',
    name: 'Paytowin',
    baseUrl: 'https://paytowin.cl',
  },
  catlotus: {
    id: 'catlotus',
    name: 'Catlotus',
    // Sin URL real: Catlotus queda fuera del scraping automatizado (robots.txt).
    baseUrl: null,
  },
} as const;

export type TargetStoreId = keyof typeof TARGET_STORES;
export type TargetStoreName = (typeof TARGET_STORES)[TargetStoreId]['name'];
