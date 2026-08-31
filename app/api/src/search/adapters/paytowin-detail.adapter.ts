import { Injectable } from '@nestjs/common';
import { TARGET_STORES } from '../../stores/stores.constants';
import { StoreHttpService } from '../../stores/store-http.service';
import { ShopifyProductAdapter } from './shopify-product.adapter';

/**
 * Adapter de detalle de Paytowin (Shopify). Consulta `/products/<handle>.js` y
 * normaliza las variantes a `OfferVariant` con `store = 'paytowin'`.
 */
@Injectable()
export class PaytowinDetailAdapter extends ShopifyProductAdapter {
  constructor(http: StoreHttpService) {
    super(http, TARGET_STORES.paytowin.baseUrl, TARGET_STORES.paytowin.id);
  }
}
