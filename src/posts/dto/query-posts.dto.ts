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
    example: '9bb0f37e-1e30-4df9-bd11-8cf5fe8ef2ab',
    description: 'Filtra publicaciones por carrera.',
  })
  @IsOptional()
  @IsUUID()
  careerId?: string;

  @ApiPropertyOptional({
    example: '7a9ad4a2-c0ba-445f-a57f-7925e4f0d52f',
    description: 'Filtra publicaciones por autor.',
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;
}
