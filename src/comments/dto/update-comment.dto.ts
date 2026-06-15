import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    example: 'Actualizo el comentario con mas contexto para la conversacion.',
    description: 'Nuevo contenido del comentario.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
