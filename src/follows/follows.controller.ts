import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import {
  exampleIds,
  followNetworkExample,
  followStatsExample,
  followSuggestionExample,
} from '../common/swagger/swagger.examples';

@Controller('follows')
@UseGuards(JwtAuthGuard)
@ApiTags('Follows')
@ApiBearerAuth('bearer')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Red de seguimiento del usuario autenticado',
    description:
      'Flujo real del frontend: ProfilePage y followService.getMyFollowNetwork.',
  })
  @ApiOkResponse({
    description: 'Seguidores, seguidos y conteos del usuario autenticado.',
    schema: {
      example: followNetworkExample,
    },
  })
  getMine(@CurrentUser() user: RequestUser) {
    return this.followsService.getMine(user.userId);
  }

  @Get('stats/:userId')
  @ApiOperation({
    summary: 'Estadisticas de seguimiento de un usuario',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario a consultar.',
    example: exampleIds.userId,
  })
  @ApiOkResponse({
    description: 'Cantidad de seguidores y seguidos.',
    schema: {
      example: followStatsExample,
    },
  })
  getStats(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.followsService.getStats(userId);
  }

  @Get('suggestions')
  @ApiOperation({
    summary: 'Sugerencias de perfiles a seguir',
    description:
      'Flujo real del frontend: ExplorePanel y SearchPanel muestran estas sugerencias.',
  })
  @ApiOkResponse({
    description: 'Lista de usuarios sugeridos con estado de seguimiento.',
    schema: {
      example: [followSuggestionExample],
    },
  })
  getSuggestions(@CurrentUser() user: RequestUser) {
    return this.followsService.getSuggestions(user.userId);
  }

  @Post(':userId')
  @ApiOperation({
    summary: 'Seguir a un usuario',
    description:
      'Flujo real del frontend: ProfilePage o SearchPanel -> followService.followUser.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario a seguir.',
    example: exampleIds.peerUserId,
  })
  @ApiOkResponse({
    description: 'Relacion de seguimiento creada o ya existente.',
    schema: {
      example: {
        message: 'User followed successfully',
        isFollowing: true,
      },
    },
  })
  follow(
    @Param('userId', ParseUUIDPipe) followingId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.followsService.follow(user.userId, followingId);
  }

  @Delete(':userId')
  @ApiOperation({
    summary: 'Dejar de seguir a un usuario',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario a dejar de seguir.',
    example: exampleIds.peerUserId,
  })
  @ApiOkResponse({
    description: 'Relacion de seguimiento eliminada o ya inexistente.',
    schema: {
      example: {
        message: 'User unfollowed successfully',
        isFollowing: false,
      },
    },
  })
  unfollow(
    @Param('userId', ParseUUIDPipe) followingId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.followsService.unfollow(user.userId, followingId);
  }
}
