import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { searchResultsExample } from '../common/swagger/swagger.examples';

@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiTags('Search')
@ApiBearerAuth('bearer')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Busqueda global',
    description:
      'Flujo real del frontend: SearchPanel -> searchService.searchAll. Devuelve usuarios, carreras y posts.',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    example: 'lucia',
    description: 'Texto libre para buscar por nombre, email, carrera o contenido.',
  })
  @ApiOkResponse({
    description: 'Resultados agrupados de la busqueda.',
    schema: {
      example: searchResultsExample,
    },
  })
  search(
    @Query('q') query: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.searchService.search(user.userId, query);
  }
}
