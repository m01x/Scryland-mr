export interface HealthResponse {
  status: string;
  uptime: number;
  version: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
}

export type StoreId = 'ineko' | 'paytowin' | 'catlotus'

export interface StoreOffer {
  /** Id canónico de tienda. */
  store: StoreId;
  price: number | null;
  currency: string;
  available: boolean;
  /** Deep-link al producto en la tienda. Requerido desde Spec 10. */
  url: string;
  /** Slug del producto, para pedir el detalle de variantes. Requerido desde Spec 11. */
  handle: string;
  /** Imagen destacada del producto (desde `featured_image` de `suggest.json`). */
  imageUrl?: string;
}

export interface SearchResult {
  id: string;
  cardName: string;
  set: string;
  editionLabel: string;
  offers: StoreOffer[];
  bestPrice: number | null;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalEditions: number;
}

export type CardCondition =
  | 'Near Mint'
  | 'Lightly Played'
  | 'Moderately Played'
  | 'Heavily Played'
  | 'Damaged'

export type CardFinish = 'normal' | 'foil'

export interface OfferVariant {
  /** Condición (union tipada). `null` si el SKU no matchea y `option1` no deriva. */
  condition: CardCondition | null;
  /** Idioma (código de 2 chars del SKU, ej. `EN`). `null` si no derivable. */
  language: string | null;
  /** Acabado: normal o foil. `null` si no derivable. */
  finish: CardFinish | null;
  /** Precio exacto de la variante en CLP (ya dividido por 100). */
  price: number | null;
  /** Disponibilidad por variante (fuente de verdad de stock). */
  available: boolean;
  /** Deep-link a la variante (`?variant=<id>`). */
  url: string;
}

export interface OfferDetailResponse {
  store: StoreId;
  handle: string;
  imageUrl?: string;
  productUrl: string;
  variants: OfferVariant[];
}
