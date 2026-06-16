import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'tu.nombre@ucb.edu.bo',
    description: 'Correo institucional del usuario que desea restablecer la contraseña.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'Nueva contraseña con al menos 8 caracteres.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;
}
