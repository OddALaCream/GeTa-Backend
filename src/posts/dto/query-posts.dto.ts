import { swaggerReferenceNotes } from '../../common/swagger/swagger.examples';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class QueryPostsDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Numero de pagina para paginacion.',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Cantidad maxima de posts por pagina.',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: '2e75860d-3bc6-4392-8ce8-03a961ccfa09',
    description: `Filtra publicaciones por carrera. ${swaggerReferenceNotes.careers}`,
  })
  @IsOptional()
  @IsUUID()
  careerId?: string;

  @ApiPropertyOptional({
    example: '45af29fa-53c6-4344-8cc6-9d91364896a9',
    description: `Filtra publicaciones por autor. ${swaggerReferenceNotes.users}`,
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;
}
