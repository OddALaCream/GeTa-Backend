import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    example: '2f5bb4a8-932d-4cc6-8e79-fd55de0a67b9',
    description: 'ID del usuario destinatario.',
  })
  @IsUUID()
  recipientId: string;

  @ApiProperty({
    example: 'Cuando tengas fecha para la demo, avisame y lo cubrimos.',
    description: 'Mensaje a enviar.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
