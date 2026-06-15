import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from './interfaces/request-user.interface';
import {
  authMeExample,
  authUserExample,
  exampleIds,
  swaggerDemoAccount,
} from '../common/swagger/swagger.examples';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar una cuenta',
    description:
      'Flujo real del frontend: RegisterPage -> CareerSelectionPage -> authService.registerRequest.',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      seededFlow: {
        summary: 'Registro de estudiante',
        value: {
          email: 'nuevo.estudiante@ucb.edu.bo',
          password: 'Password123!',
          fullName: 'Nuevo Estudiante',
          careerId: exampleIds.careerId,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Cuenta creada correctamente.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-token',
        user: authUserExample,
      },
    },
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesion',
    description:
      'Flujo real del frontend: LoginPage -> authService.loginRequest. Este endpoint devuelve el JWT para autorizar el resto de la API.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      seedAccount: {
        summary: 'Cuenta seed recomendada para pruebas',
        value: swaggerDemoAccount,
      },
    },
  })
  @ApiOkResponse({
    description: 'Sesion iniciada correctamente.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-token',
        user: authUserExample,
      },
    },
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Obtener usuario autenticado',
    description:
      'Flujo real del frontend: authService.fetchCurrentUser. Devuelve el usuario actual con su perfil y carrera.',
  })
  @ApiOkResponse({
    description: 'Usuario autenticado con perfil cargado.',
    schema: {
      example: authMeExample,
    },
  })
  me(@CurrentUser() user: RequestUser) {
    return this.authService.me(user.userId);
  }
}
