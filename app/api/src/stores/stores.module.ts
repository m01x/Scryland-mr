import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { StoreHttpService } from './store-http.service';

/**
 * Módulo de tiendas. Expone la infraestructura de consulta (cliente HTTP
 * compartido + cache TTL) sin endpoints ni scraping todavía: esos se agregan
 * en una spec futura.
 */
@Module({
  providers: [StoreHttpService, CacheService],
  exports: [StoreHttpService, CacheService],
})
export class StoresModule {}
