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
    example: '9bb0f37e-1e30-4df9-bd11-8cf5fe8ef2ab',
    description: 'ID de carrera obtenido desde GET /careers.',
  })
  @IsUUID()
  careerId: string;
}
