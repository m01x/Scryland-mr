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

export interface StoreOffer {
  /** Id canónico de tienda: 'ineko' | 'paytowin' | 'catlotus'. */
  store: string;
  price: number | null;
  currency: string;
  available: boolean;
  /** Deep-link al producto en la tienda. Opcional en Spec 09; requerido desde Spec 10. */
  url?: string;
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
