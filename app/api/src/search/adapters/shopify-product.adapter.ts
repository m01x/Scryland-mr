import type {
  OfferDetailResponse,
  OfferVariant,
  StoreId,
} from '@scryland/shared';
import { StoreHttpService } from '../../stores/store-http.service';
import type { DetailAdapter } from './detail-adapter.interface';
import { parseCentsPrice, parseOption1, parseSku } from './product-parsing';
import type {
  ShopifyProductDetail,
  ShopifyProductVariant,
} from './shopify-product.types';

/**
 * Base común para el detalle de producto de las tiendas Shopify (Ineko y
 * Paytowin). Consulta `/products/<handle>.js` y normaliza las variantes a
 * `OfferVariant`. El precio viene en centavos y se divide por 100 (CLP entero);
 * el SKU es la fuente de verdad de condición/idioma/foil, con fallback a
 * `option1`. Cada subclase aporta su `baseUrl` e id canónico.
 */
export abstract class ShopifyProductAdapter implements DetailAdapter {
  protected constructor(
    protected readonly http: StoreHttpService,
    protected readonly baseUrl: string,
    readonly storeId: StoreId,
  ) {}

  async getDetail(handle: string): Promise<OfferDetailResponse> {
    const url = `${this.baseUrl}/products/${handle}.js`;
    const product = await this.http.get<ShopifyProductDetail>(url);

    const variants = (product?.variants ?? [])
      .map((variant) => this.toOfferVariant(variant, handle))
      .filter((variant): variant is OfferVariant => variant !== null);

    return {
      store: this.storeId,
      handle,
      imageUrl: product?.featured_image?.url,
      productUrl: `${this.baseUrl}/products/${handle}`,
      variants,
    };
  }

  private toOfferVariant(
    variant: ShopifyProductVariant,
    handle: string,
  ): OfferVariant | null {
    // Sin id no hay deep-link útil (`?variant=<id>`): se descarta la variante.
    if (variant.id === null || variant.id === undefined) {
      return null;
    }

    const sku = parseSku(variant.sku);
    const title = parseOption1(variant.option1);

    return {
      condition: sku.condition ?? title.condition,
      language: sku.language,
      finish: sku.finish ?? title.finish,
      price: parseCentsPrice(variant.price),
      available: variant.available === true,
      url: `${this.baseUrl}/products/${handle}?variant=${variant.id}`,
    };
  }
}
