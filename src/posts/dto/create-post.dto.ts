import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: '9bb0f37e-1e30-4df9-bd11-8cf5fe8ef2ab',
    description: 'ID de carrera asociada al post.',
  })
  @IsUUID()
  careerId: string;

  @ApiProperty({
    example:
      'Acabamos de cerrar una demo del prototipo para la feria de innovacion. Si alguien quiere sumarse al backend o al testing, escriban.',
    description: 'Texto principal de la publicacion.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    description: 'URL opcional de imagen o recurso multimedia.',
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;
}
