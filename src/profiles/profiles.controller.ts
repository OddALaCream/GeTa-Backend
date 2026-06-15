import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import {
  authUserExample,
  exampleIds,
  profileSummaryExample,
  swaggerReferenceNotes,
} from '../common/swagger/swagger.examples';

@Controller('profiles')
@ApiTags('Profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Obtener mi perfil',
    description:
      'Flujo real del frontend: ProfilePage cuando el usuario abre su propio perfil.',
  })
  @ApiOkResponse({
    description: 'Perfil del usuario autenticado.',
    schema: {
      example: {
        ...profileSummaryExample,
        user: authUserExample,
      },
    },
  })
  getMyProfile(@CurrentUser() user: RequestUser) {
    return this.profilesService.findByUserId(user.userId);
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Obtener perfil publico por userId',
    description:
      'Flujo real del frontend: ProfilePage cuando se visita el perfil de otro estudiante.',
  })
  @ApiParam({
    name: 'userId',
    description: `ID del usuario propietario del perfil. ${swaggerReferenceNotes.users}`,
    example: exampleIds.userId,
  })
  @ApiOkResponse({
    description: 'Perfil encontrado.',
    schema: {
      example: {
        ...profileSummaryExample,
        user: authUserExample,
      },
    },
  })
  getProfile(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.profilesService.findByUserId(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Actualizar mi perfil',
    description:
      'Flujo real del frontend: ProfilePage -> profileService.updateMyProfile.',
  })
  @ApiBody({
    type: UpdateProfileDto,
  })
  @ApiOkResponse({
    description: 'Perfil actualizado.',
    schema: {
      example: {
        id: profileSummaryExample.id,
        userId: profileSummaryExample.userId,
        fullName: profileSummaryExample.fullName,
        bio: 'Actualice la bio desde el formulario del perfil.',
        avatarUrl: profileSummaryExample.avatarUrl,
        campus: profileSummaryExample.campus,
        careerId: profileSummaryExample.careerId,
        createdAt: '2026-06-09T12:00:00.000Z',
        updatedAt: '2026-06-09T13:45:00.000Z',
      },
    },
  })
  updateMyProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.updateByUserId(user.userId, dto);
  }
}
