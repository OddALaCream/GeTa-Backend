import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { SendMessageDto } from './dto/send-message.dto';
import {
  conversationDetailExample,
  conversationSummaryExample,
  exampleIds,
  messageExample,
} from '../common/swagger/swagger.examples';

@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiTags('Messages')
@ApiBearerAuth('bearer')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Resumen de mensajes no leidos',
    description:
      'Flujo real del frontend: HomeTopbar y DashboardOverviewPanel consultan este contador.',
  })
  @ApiOkResponse({
    description: 'Cantidad de mensajes no leidos.',
    schema: {
      example: { unreadCount: 1 },
    },
  })
  getSummary(@CurrentUser() user: RequestUser) {
    return this.messagesService.getSummary(user.userId);
  }

  @Get('conversations')
  @ApiOperation({
    summary: 'Listar conversaciones del usuario autenticado',
    description:
      'Flujo real del frontend: MessagesPanel -> messageService.getConversations.',
  })
  @ApiOkResponse({
    description: 'Lista resumida de conversaciones con ultimo mensaje.',
    schema: {
      example: [conversationSummaryExample],
    },
  })
  getConversations(@CurrentUser() user: RequestUser) {
    return this.messagesService.getConversations(user.userId);
  }

  @Get('with/:userId')
  @ApiOperation({
    summary: 'Obtener conversacion con un usuario',
    description:
      'Flujo real del frontend: MessagesPanel al abrir una conversacion especifica.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del otro usuario de la conversacion.',
    example: exampleIds.peerUserId,
  })
  @ApiOkResponse({
    description: 'Detalle de la conversacion y mensajes en orden cronologico.',
    schema: {
      example: conversationDetailExample,
    },
  })
  getConversation(
    @Param('userId', ParseUUIDPipe) peerId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.messagesService.getConversation(user.userId, peerId);
  }

  @Post()
  @ApiOperation({
    summary: 'Enviar mensaje',
    description:
      'Flujo real del frontend: MessagesPanel o ProfilePage -> messageService.sendMessage.',
  })
  @ApiBody({
    type: SendMessageDto,
  })
  @ApiCreatedResponse({
    description: 'Mensaje enviado correctamente.',
    schema: {
      example: messageExample,
    },
  })
  sendMessage(
    @CurrentUser() user: RequestUser,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user.userId, dto);
  }
}
