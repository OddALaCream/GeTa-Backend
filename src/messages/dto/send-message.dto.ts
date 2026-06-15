import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { swaggerReferenceNotes } from '../../common/swagger/swagger.examples';

export class SendMessageDto {
  @ApiProperty({
    example: '45af29fa-53c6-4344-8cc6-9d91364896a9',
    description: `ID del usuario destinatario. ${swaggerReferenceNotes.messageRecipient}`,
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
