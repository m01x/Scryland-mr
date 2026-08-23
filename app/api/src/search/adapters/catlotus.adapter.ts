import { Injectable } from '@nestjs/common';
import type { NormalizedOffer, StoreAdapter } from './store-adapter.interface';

/**
 * Stub de Catlotus: queda fuera del scraping automatizado (robots.txt en
 * `cartas.catlotus.cl`). Retorna lista vacía para mantener la estructura a tres
 * tiendas en el fan-out sin reescribirlo cuando Catlotus se integre.
 */
@Injectable()
export class CatlotusAdapter implements StoreAdapter {
  search(): Promise<NormalizedOffer[]> {
    return Promise.resolve([]);
  }
}
