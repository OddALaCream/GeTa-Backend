import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import {
  exampleIds,
  paginatedPostsExample,
  postExample,
  swaggerReferenceNotes,
} from '../common/swagger/swagger.examples';

@Controller('posts')
@ApiTags('Posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('saved/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Listar posts guardados del usuario',
    description:
      'Flujo real del frontend: HomePage en vista `saved` -> postService.getSavedPosts.',
  })
  @ApiOkResponse({
    description: 'Listado de publicaciones guardadas.',
    schema: {
      example: [postExample],
    },
  })
  findSaved(@CurrentUser() user: RequestUser) {
    return this.postsService.findSavedPosts(user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Crear publicacion',
    description:
      'Flujo real del frontend: CreatePostCard -> postService.createPost.',
  })
  @ApiBody({
    type: CreatePostDto,
  })
  @ApiCreatedResponse({
    description: 'Post creado correctamente.',
    schema: {
      example: postExample,
    },
  })
  create(
    @CurrentUser() user: RequestUser,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(user.userId, createPostDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Listar publicaciones',
    description:
      'Flujo real del frontend: Feed, SearchPanel y ProfilePage usan esta ruta con filtros opcionales.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({
    name: 'careerId',
    required: false,
    example: exampleIds.careerId,
    description: swaggerReferenceNotes.careers,
  })
  @ApiQuery({
    name: 'authorId',
    required: false,
    example: exampleIds.userId,
    description: swaggerReferenceNotes.users,
  })
  @ApiOkResponse({
    description: 'Posts paginados segun los filtros enviados.',
    schema: {
      example: paginatedPostsExample,
    },
  })
  findAll(@Query() query: QueryPostsDto, @CurrentUser() user: RequestUser) {
    return this.postsService.findAll(query, user.userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Dar like a un post',
    description:
      'Flujo real del frontend: PostCard -> postService.likePost.',
  })
  @ApiParam({
    name: 'id',
    description: `ID del post. ${swaggerReferenceNotes.posts}`,
    example: exampleIds.postId,
  })
  @ApiOkResponse({
    description: 'Like aplicado o ya existente.',
    schema: {
      example: {
        message: 'Post liked successfully',
        post: {
          ...postExample,
          likesCount: 3,
          likedByCurrentUser: true,
        },
      },
    },
  })
  like(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.postsService.like(id, user.userId);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Quitar like de un post',
  })
  @ApiParam({
    name: 'id',
    description: `ID del post. ${swaggerReferenceNotes.posts}`,
    example: exampleIds.postId,
  })
  @ApiOkResponse({
    description: 'Like removido o inexistente.',
    schema: {
      example: {
        message: 'Post unliked successfully',
        post: {
          ...postExample,
          likesCount: 1,
          likedByCurrentUser: false,
        },
      },
    },
  })
  unlike(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.postsService.unlike(id, user.userId);
  }

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Guardar un post',
    description:
      'Flujo real del frontend: PostCard -> postService.savePost.',
  })
  @ApiParam({
    name: 'id',
    description: `ID del post. ${swaggerReferenceNotes.posts}`,
    example: exampleIds.postId,
  })
  @ApiOkResponse({
    description: 'Post guardado o ya existente en guardados.',
    schema: {
      example: {
        message: 'Post saved successfully',
        post: {
          ...postExample,
          savedByCurrentUser: true,
        },
      },
    },
  })
  save(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.postsService.save(id, user.userId);
  }

  @Delete(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Quitar un post de guardados',
  })
  @ApiParam({
    name: 'id',
    description: `ID del post. ${swaggerReferenceNotes.posts}`,
    example: exampleIds.postId,
  })
  @ApiOkResponse({
    description: 'Post quitado de guardados o no guardado previamente.',
    schema: {
      example: {
        message: 'Post removed from saved posts',
        post: {
          ...postExample,
          savedByCurrentUser: false,
        },
      },
    },
  })
  unsave(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.postsService.unsave(id, user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Obtener un post por ID',
    description:
      'Flujo real del frontend: Feed resuelve un `postId` destacado o enlazado.',
  })
  @ApiParam({
    name: 'id',
    description: `ID del post. ${swaggerReferenceNotes.posts}`,
    example: exampleIds.postId,
  })
  @ApiOkResponse({
    description: 'Post encontrado.',
    schema: {
      example: postExample,
    },
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.postsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Actualizar publicacion propia',
  })
  @ApiParam({
    name: 'id',
    description: `ID del post. ${swaggerReferenceNotes.posts}`,
    example: exampleIds.postId,
  })
  @ApiBody({
    type: UpdatePostDto,
  })
  @ApiOkResponse({
    description: 'Post actualizado.',
    schema: {
      example: {
        ...postExample,
        content: 'Actualizo la publicacion con el nuevo estado del proyecto.',
      },
    },
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.userId, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Eliminar publicacion propia',
  })
  @ApiParam({
    name: 'id',
    description: `ID del post. ${swaggerReferenceNotes.posts}`,
    example: exampleIds.postId,
  })
  @ApiOkResponse({
    description: 'Post marcado como eliminado.',
    schema: {
      example: {
        message: 'Post deleted successfully',
      },
    },
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.postsService.remove(id, user.userId);
  }
}
