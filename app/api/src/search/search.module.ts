import { Module } from '@nestjs/common';
import { StoresModule } from '../stores/stores.module';
import { CatlotusAdapter } from './adapters/catlotus.adapter';
import { InekoAdapter } from './adapters/ineko.adapter';
import { PaytowinAdapter } from './adapters/paytowin.adapter';
import { STORE_ADAPTERS } from './adapters/store-adapter.interface';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

/**
 * Módulo de búsqueda: consulta las tiendas (fan-out), normaliza a prints y
 * expone `GET /api/search?q=`. Importa `StoresModule` para `StoreHttpService` y
 * `CacheService`.
 */
@Module({
  imports: [StoresModule],
  controllers: [SearchController],
  providers: [
    SearchService,
    InekoAdapter,
    PaytowinAdapter,
    CatlotusAdapter,
    {
      provide: STORE_ADAPTERS,
      inject: [InekoAdapter, PaytowinAdapter, CatlotusAdapter],
      useFactory: (
        ineko: InekoAdapter,
        paytowin: PaytowinAdapter,
        catlotus: CatlotusAdapter,
      ) => [ineko, paytowin, catlotus],
    },
  ],
})
export class SearchModule {}
