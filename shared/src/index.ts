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
  store: string;
  price: number | null;
  currency: string;
  available: boolean;
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
