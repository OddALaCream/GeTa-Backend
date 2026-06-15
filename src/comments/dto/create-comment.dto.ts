import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: '4e8bc4c1-a05f-45a6-a5a6-937aab10f1f9',
    description: 'ID del post que recibira el comentario.',
  })
  @IsUUID()
  postId: string;

  @ApiProperty({
    example: 'Me interesa cubrir el proyecto cuando salga la version final.',
    description: 'Contenido textual del comentario.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
