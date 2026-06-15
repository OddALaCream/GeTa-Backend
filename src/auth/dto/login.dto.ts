import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'lucia.suarez@ucb.edu.bo',
    description: 'Correo institucional del estudiante.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contrasena de la cuenta.',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
