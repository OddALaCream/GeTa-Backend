import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { dashboardOverviewExample } from '../common/swagger/swagger.examples';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiTags('Dashboard')
@ApiBearerAuth('bearer')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Resumen lateral del dashboard',
    description:
      'Flujo real del frontend: DashboardOverviewPanel -> dashboardService.getDashboardOverview.',
  })
  @ApiOkResponse({
    description: 'Resumen de actividad, perfil y pendientes del usuario.',
    schema: {
      example: dashboardOverviewExample,
    },
  })
  getOverview(@CurrentUser() user: RequestUser) {
    return this.dashboardService.getOverview(user.userId);
  }
}
