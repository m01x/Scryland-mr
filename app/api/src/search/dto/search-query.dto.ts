import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Query param de `GET /api/search`. `q` es la consulta de búsqueda; se recorta
 * (trim) antes de validar para que `" Sol Ring "` cuente como válida y no
 * pase como vacía.
 */
export class SearchQueryDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  q: string;
}
