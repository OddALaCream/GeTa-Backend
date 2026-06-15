import { swaggerReferenceNotes } from '../../common/swagger/swagger.examples';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'af211c8b-9024-40e1-9859-337f207cb428',
    description: `ID del post que recibira el comentario. ${swaggerReferenceNotes.posts}`,
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
