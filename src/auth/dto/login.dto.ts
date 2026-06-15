import {
  swaggerDemoAccount,
  swaggerHasDemoAccount,
} from '../../common/swagger/swagger.examples';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: swaggerHasDemoAccount
      ? swaggerDemoAccount.email
      : 'tu.cuenta@ucb.edu.bo',
    description: 'Correo de una cuenta existente en la BD remota.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: swaggerHasDemoAccount
      ? swaggerDemoAccount.password
      : 'tu-password-real',
    description: 'Contrasena de la cuenta elegida para Swagger.',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
