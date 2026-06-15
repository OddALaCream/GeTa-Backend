import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @ApiPropertyOptional({
    example: 'Actualizo la publicacion con el nuevo estado del proyecto.',
    description: 'Nuevo texto de la publicacion.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    description: 'Nueva URL multimedia o null si se omite.',
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;
}
