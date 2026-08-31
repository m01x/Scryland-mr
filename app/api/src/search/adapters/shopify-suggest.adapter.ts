import type { StoreId, StoreOffer } from '@scryland/shared';
import { SUGGEST_ENDPOINT_PATH } from '../../stores/stores.constants';
import { StoreHttpService } from '../../stores/store-http.service';
import { normalizePrint, parsePrice } from '../normalize';
import type { NormalizedOffer, StoreAdapter } from './store-adapter.interface';
import type {
  ShopifyProduct,
  ShopifySuggestResponse,
} from './shopify-suggest.types';

const SUGGEST_LIMIT = 20;

/**
 * Base común para las tiendas Shopify (Ineko y Paytowin). Comparte la URL de
 * consulta, el filtrado por `type === "MTG Single"` y el mapeo del shape crudo
 * a `NormalizedOffer`. Cada subclase aporta su `baseUrl` e id canónico.
 */
export abstract class ShopifySuggestAdapter implements StoreAdapter {
  protected constructor(
    protected readonly http: StoreHttpService,
    protected readonly baseUrl: string,
    protected readonly storeId: StoreId,
  ) {}

  async search(query: string): Promise<NormalizedOffer[]> {
    const url = this.buildSuggestUrl(query);
    const response = await this.http.get<ShopifySuggestResponse>(url);

    const products = response?.resources?.results?.products ?? [];

    return products
      .filter((product) => product.type === 'MTG Single')
      .map((product) => this.toNormalizedOffer(product));
  }

  private buildSuggestUrl(query: string): string {
    return (
      `${this.baseUrl}${SUGGEST_ENDPOINT_PATH}` +
      `?q=${encodeURIComponent(query)}` +
      `&resources[type]=product&resources[limit]=${SUGGEST_LIMIT}`
    );
  }

  private toNormalizedOffer(product: ShopifyProduct): NormalizedOffer {
    const parsed = normalizePrint(product.title, product.body, product.handle);

    const offer: StoreOffer = {
      store: this.storeId,
      price: parsePrice(product.price),
      currency: 'CLP',
      available: product.available,
      // Deep-link limpio, sin la query de tracking (`?_pos=...`).
      url: `${this.baseUrl}/products/${product.handle}`,
      // Identificador para pedir el detalle de variantes (no derivar del `url`).
      handle: product.handle,
      imageUrl: product.featured_image?.url,
    };

    return {
      printKey: parsed.printKey,
      cardName: parsed.cardName,
      set: parsed.set,
      editionLabel: parsed.editionLabel,
      offer,
    };
  }
}
