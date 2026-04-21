import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  postId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
