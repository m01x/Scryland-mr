import { Injectable } from '@nestjs/common';
import { TARGET_STORES } from '../../stores/stores.constants';
import { StoreHttpService } from '../../stores/store-http.service';
import { ShopifySuggestAdapter } from './shopify-suggest.adapter';

/**
 * Adapter de Paytowin (Shopify). Consulta `/search/suggest.json` y normaliza
 * los productos a ofertas con `store = 'paytowin'`.
 */
@Injectable()
export class PaytowinAdapter extends ShopifySuggestAdapter {
  constructor(http: StoreHttpService) {
    super(http, TARGET_STORES.paytowin.baseUrl, TARGET_STORES.paytowin.id);
  }
}
