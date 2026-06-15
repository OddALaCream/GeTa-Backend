import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CareersService } from './careers.service';
import { PostsService } from '../posts/posts.service';
import { QueryPostsDto } from '../posts/dto/query-posts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import {
  careerExample,
  exampleIds,
  paginatedPostsExample,
} from '../common/swagger/swagger.examples';

@Controller('careers')
@ApiTags('Careers')
export class CareersController {
  constructor(
    private readonly careersService: CareersService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar carreras',
    description:
      'Flujo real del frontend: CareerSelectionPage y SearchPanel consumen esta ruta para mostrar carreras disponibles.',
  })
  @ApiOkResponse({
    description: 'Listado de carreras ordenadas alfabeticamente.',
    schema: {
      example: [careerExample],
    },
  })
  findAll() {
    return this.careersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una carrera por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la carrera.',
    example: exampleIds.careerId,
  })
  @ApiOkResponse({
    description: 'Carrera encontrada.',
    schema: {
      example: careerExample,
    },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.careersService.findOne(id);
  }

  @Get(':id/posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Listar posts de una carrera',
    description:
      'Flujo real del frontend: HomePage en vista `career` y SearchPanel al entrar por una carrera.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la carrera a consultar.',
    example: exampleIds.careerId,
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({
    description: 'Posts paginados de la carrera solicitada.',
    schema: {
      example: paginatedPostsExample,
    },
  })
  getPostsByCareer(
    @Param('id', ParseUUIDPipe) careerId: string,
    @Query() query: QueryPostsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.postsService.findAll({ ...query, careerId }, user.userId);
  }
}
