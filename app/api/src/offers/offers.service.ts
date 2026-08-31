import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { OfferDetailResponse } from '@scryland/shared';
import {
  DETAIL_ADAPTERS,
  type DetailAdapter,
} from '../search/adapters/detail-adapter.interface';
import { CacheService } from '../stores/cache.service';

const OFFER_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

/**
 * Detalle de variantes de un producto por tienda, bajo demanda. Cachea por
 * `offers:<store>:<handle>` (TTL 30 min) para no reconsultar la tienda ante
 * aperturas repetidas del mismo modal.
 */
@Injectable()
export class OffersService {
  constructor(
    private readonly cacheService: CacheService,
    @Inject(DETAIL_ADAPTERS)
    private readonly adapters: DetailAdapter[],
  ) {}

  async getOfferDetail(
    store: string,
    handle: string,
  ): Promise<OfferDetailResponse> {
    const adapter = this.adapters.find((a) => a.storeId === store);
    if (!adapter) {
      throw new NotFoundException(
        `Store "${store}" does not support offer details`,
      );
    }

    const cacheKey = `offers:${store}:${handle}`;
    const cached = this.cacheService.get<OfferDetailResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const detail = await adapter.getDetail(handle);
    this.cacheService.set(cacheKey, detail, OFFER_CACHE_TTL_MS);
    return detail;
  }
}
