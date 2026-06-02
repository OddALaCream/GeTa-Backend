import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: RequestUser) {
    return this.messagesService.getSummary(user.userId);
  }

  @Get('conversations')
  getConversations(@CurrentUser() user: RequestUser) {
    return this.messagesService.getConversations(user.userId);
  }

  @Get('with/:userId')
  getConversation(
    @Param('userId', ParseUUIDPipe) peerId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.messagesService.getConversation(user.userId, peerId);
  }

  @Post()
  sendMessage(
    @CurrentUser() user: RequestUser,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user.userId, dto);
  }
}
