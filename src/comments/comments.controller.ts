import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.userId, createCommentDto);
  }

  @Get('post/:postId')
  findByPost(@Param('postId', ParseUUIDPipe) postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, user.userId, updateCommentDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.commentsService.remove(id, user.userId);
  }
}
