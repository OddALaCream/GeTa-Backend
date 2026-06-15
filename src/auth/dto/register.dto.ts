import { swaggerReferenceNotes } from '../../common/swagger/swagger.examples';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'nuevo.estudiante@ucb.edu.bo',
    description: 'Correo institucional del nuevo usuario.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contrasena minima de 8 caracteres.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'Nuevo Estudiante',
    description: 'Nombre completo visible en el perfil.',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: '2e75860d-3bc6-4392-8ce8-03a961ccfa09',
    description: swaggerReferenceNotes.careers,
  })
  @IsUUID()
  careerId: string;
}
