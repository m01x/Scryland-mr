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
