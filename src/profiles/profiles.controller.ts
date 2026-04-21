import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@CurrentUser() user: RequestUser) {
    return this.profilesService.findByUserId(user.userId);
  }

  @Get(':userId')
  getProfile(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.profilesService.findByUserId(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.updateByUserId(user.userId, dto);
  }
}
