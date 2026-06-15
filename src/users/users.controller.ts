import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  authUserExample,
  exampleIds,
  swaggerReferenceNotes,
} from '../common/swagger/swagger.examples';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@ApiBearerAuth('bearer')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios',
    description:
      'Ruta administrativa/simple de lectura. Tambien puede servir para obtener IDs reales y probar otras rutas en Swagger.',
  })
  @ApiOkResponse({
    description: 'Listado de usuarios ordenados por creacion descendente.',
    schema: {
      example: [authUserExample],
    },
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
  })
  @ApiParam({
    name: 'id',
    description: `ID del usuario. ${swaggerReferenceNotes.users}`,
    example: exampleIds.userId,
  })
  @ApiOkResponse({
    description: 'Usuario encontrado.',
    schema: {
      example: authUserExample,
    },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }
}
