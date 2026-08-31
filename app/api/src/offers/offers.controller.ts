import { Controller, Get, Param } from '@nestjs/common';
import type { OfferDetailResponse } from '@scryland/shared';
import { OfferParamsDto } from './dto/offer-params.dto';
import { OffersService } from './offers.service';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get(':store/:handle')
  getOfferDetail(
    @Param() params: OfferParamsDto,
  ): Promise<OfferDetailResponse> {
    return this.offersService.getOfferDetail(params.store, params.handle);
  }
}
