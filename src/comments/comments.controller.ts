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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import {
  exampleIds,
  postCommentExample,
} from '../common/swagger/swagger.examples';

@Controller('comments')
@UseGuards(JwtAuthGuard)
@ApiTags('Comments')
@ApiBearerAuth('bearer')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear comentario',
    description:
      'Flujo real del frontend: PostCard -> CommentInput -> commentService.createComment.',
  })
  @ApiBody({
    type: CreateCommentDto,
  })
  @ApiCreatedResponse({
    description: 'Comentario creado correctamente.',
    schema: {
      example: postCommentExample,
    },
  })
  create(
    @CurrentUser() user: RequestUser,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.userId, createCommentDto);
  }

  @Get('post/:postId')
  @ApiOperation({
    summary: 'Listar comentarios de un post',
    description:
      'Flujo real del frontend: PostCard -> CommentList -> commentService.getCommentsByPost.',
  })
  @ApiParam({
    name: 'postId',
    description: 'ID del post.',
    example: exampleIds.postId,
  })
  @ApiOkResponse({
    description: 'Comentarios visibles del post.',
    schema: {
      example: [postCommentExample],
    },
  })
  findByPost(@Param('postId', ParseUUIDPipe) postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar comentario propio',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del comentario.',
    example: exampleIds.commentId,
  })
  @ApiBody({
    type: UpdateCommentDto,
  })
  @ApiOkResponse({
    description: 'Comentario actualizado.',
    schema: {
      example: {
        ...postCommentExample,
        content: 'Actualizo el comentario con mas contexto para la conversacion.',
      },
    },
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, user.userId, updateCommentDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar comentario propio',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del comentario.',
    example: exampleIds.commentId,
  })
  @ApiOkResponse({
    description: 'Comentario marcado como eliminado.',
    schema: {
      example: {
        message: 'Comment deleted successfully',
      },
    },
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.commentsService.remove(id, user.userId);
  }
}
