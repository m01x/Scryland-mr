import { Injectable } from '@nestjs/common';
import { TARGET_STORES } from '../../stores/stores.constants';
import { StoreHttpService } from '../../stores/store-http.service';
import { ShopifyProductAdapter } from './shopify-product.adapter';

/**
 * Adapter de detalle de Ineko (Shopify). Consulta `/products/<handle>.js` y
 * normaliza las variantes a `OfferVariant` con `store = 'ineko'`.
 */
@Injectable()
export class InekoDetailAdapter extends ShopifyProductAdapter {
  constructor(http: StoreHttpService) {
    super(http, TARGET_STORES.ineko.baseUrl, TARGET_STORES.ineko.id);
  }
}
