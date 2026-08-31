import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Route params de `GET /api/offers/:store/:handle`. Solo se valida `handle`
 * (vacío → 400); `store` se resuelve en el servicio (tienda sin adapter de
 * detalle, incluyendo catlotus → 404).
 */
export class OfferParamsDto {
  @IsString()
  store: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  handle: string;
}
