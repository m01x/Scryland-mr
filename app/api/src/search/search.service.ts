import { Inject, Injectable, Logger } from '@nestjs/common';
import type {
  SearchResponse,
  SearchResult,
  StoreOffer,
} from '@scryland/shared';
import { CacheService } from '../stores/cache.service';
import { normalizeQuery } from './normalize';
import {
  STORE_ADAPTERS,
  type NormalizedOffer,
  type StoreAdapter,
} from './adapters/store-adapter.interface';

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly cacheService: CacheService,
    @Inject(STORE_ADAPTERS)
    private readonly adapters: StoreAdapter[],
  ) {}

  async search(query: string): Promise<SearchResponse> {
    const normalizedQuery = normalizeQuery(query);
    const cacheKey = `search:${normalizedQuery}`;

    const cached = this.cacheService.get<SearchResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await this.fetchAndGroup(normalizedQuery);

    const response: SearchResponse = {
      query: normalizedQuery,
      results,
      totalEditions: results.length,
    };

    this.cacheService.set(cacheKey, response, SEARCH_CACHE_TTL_MS);
    return response;
  }

  /**
   * Fan-out a los adapters con `Promise.allSettled`: un fallo individual se
   * loguea y no tumba la respuesta (las tiendas sanas siguen aportando).
   */
  private async fetchAndGroup(query: string): Promise<SearchResult[]> {
    const settled = await Promise.allSettled(
      this.adapters.map((adapter) => adapter.search(query)),
    );

    const byPrintKey = new Map<string, NormalizedOffer[]>();

    settled.forEach((result) => {
      if (result.status === 'fulfilled') {
        for (const offer of result.value) {
          const bucket = byPrintKey.get(offer.printKey) ?? [];
          bucket.push(offer);
          byPrintKey.set(offer.printKey, bucket);
        }
      } else {
        this.logger.warn(
          `Store adapter failed: ${String(result.reason)}`,
          result.reason instanceof Error ? result.reason.stack : undefined,
        );
      }
    });

    return Array.from(byPrintKey.entries()).map(([printKey, offers]) => {
      const storeOffers: StoreOffer[] = offers.map((o) => o.offer);

      return {
        id: printKey,
        cardName: offers[0].cardName,
        set: offers[0].set,
        editionLabel: offers[0].editionLabel,
        offers: storeOffers,
        bestPrice: this.computeBestPrice(storeOffers),
      };
    });
  }

  /**
   * Mínimo de las ofertas con `available === true` y `price !== null`; si no
   * hay ninguna, `null` (nunca `0` ni `Infinity`).
   */
  private computeBestPrice(offers: StoreOffer[]): number | null {
    const availablePrices = offers
      .filter((offer) => offer.available && offer.price !== null)
      .map((offer) => offer.price as number);

    if (availablePrices.length === 0) {
      return null;
    }

    return Math.min(...availablePrices);
  }
}
