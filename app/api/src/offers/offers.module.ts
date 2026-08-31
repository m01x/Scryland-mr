import { Module } from '@nestjs/common';
import { DETAIL_ADAPTERS } from '../search/adapters/detail-adapter.interface';
import { InekoDetailAdapter } from '../search/adapters/ineko-detail.adapter';
import { PaytowinDetailAdapter } from '../search/adapters/paytowin-detail.adapter';
import { StoresModule } from '../stores/stores.module';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';

/**
 * Módulo de detalle de ofertas: `GET /api/offers/:store/:handle`. Importa
 * `StoresModule` para `StoreHttpService` y `CacheService`, y registra los
 * adapters de detalle (ineko/paytowin) bajo el token `DETAIL_ADAPTERS`.
 */
@Module({
  imports: [StoresModule],
  controllers: [OffersController],
  providers: [
    OffersService,
    InekoDetailAdapter,
    PaytowinDetailAdapter,
    {
      provide: DETAIL_ADAPTERS,
      inject: [InekoDetailAdapter, PaytowinDetailAdapter],
      useFactory: (
        ineko: InekoDetailAdapter,
        paytowin: PaytowinDetailAdapter,
      ) => [ineko, paytowin],
    },
  ],
})
export class OffersModule {}
