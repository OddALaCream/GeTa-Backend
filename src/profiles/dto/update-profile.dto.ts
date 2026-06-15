import { swaggerReferenceNotes } from '../../common/swagger/swagger.examples';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Lucia Suarez',
    description: 'Nombre completo visible en el perfil.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @ApiPropertyOptional({
    example: 'Construyo interfaces, tomo cafe y siempre tengo una idea para una hackathon.',
    description: 'Biografia del estudiante.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://i.pravatar.cc/300?img=32',
    description: 'URL publica del avatar.',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: '2e75860d-3bc6-4392-8ce8-03a961ccfa09',
    description: `Nuevo ID de carrera. ${swaggerReferenceNotes.careers}`,
  })
  @IsOptional()
  @IsUUID()
  careerId?: string;
}
