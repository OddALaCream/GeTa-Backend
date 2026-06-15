import { Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import {
  exampleIds,
  notificationExample,
  swaggerReferenceNotes,
} from '../common/swagger/swagger.examples';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiTags('Notifications')
@ApiBearerAuth('bearer')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Resumen de notificaciones no leidas',
    description:
      'Flujo real del frontend: HomeTopbar y DashboardOverviewPanel consultan este contador.',
  })
  @ApiOkResponse({
    description: 'Cantidad de notificaciones no leidas. Si tu cuenta aun no recibio actividad, el contador sera 0.',
    schema: {
      example: { unreadCount: 0 },
    },
  })
  getSummary(@CurrentUser() user: RequestUser) {
    return this.notificationsService.getSummary(user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar notificaciones del usuario',
    description:
      'Flujo real del frontend: NotificationsPanel -> notificationService.getNotifications.',
  })
  @ApiOkResponse({
    description: 'Listado de notificaciones recientes.',
    schema: {
      example: [notificationExample],
    },
  })
  findMine(@CurrentUser() user: RequestUser) {
    return this.notificationsService.findForUser(user.userId);
  }

  @Patch('read-all')
  @ApiOperation({
    summary: 'Marcar todas las notificaciones como leidas',
  })
  @ApiOkResponse({
    description: 'Todas las notificaciones del usuario fueron marcadas como leidas.',
    schema: {
      example: {
        message: 'All notifications marked as read',
      },
    },
  })
  markAllAsRead(@CurrentUser() user: RequestUser) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Marcar una notificacion como leida',
  })
  @ApiParam({
    name: 'id',
    description: `ID de la notificacion. ${swaggerReferenceNotes.notifications}`,
    example: exampleIds.notificationId,
  })
  @ApiOkResponse({
    description: 'Notificacion actualizada a leida.',
    schema: {
      example: {
        message: 'Notification marked as read',
      },
    },
  })
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notificationsService.markAsRead(id, user.userId);
  }
}
