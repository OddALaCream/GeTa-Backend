import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get('me')
  getMine(@CurrentUser() user: RequestUser) {
    return this.followsService.getMine(user.userId);
  }

  @Get('stats/:userId')
  getStats(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.followsService.getStats(userId);
  }

  @Get('suggestions')
  getSuggestions(@CurrentUser() user: RequestUser) {
    return this.followsService.getSuggestions(user.userId);
  }

  @Post(':userId')
  follow(
    @Param('userId', ParseUUIDPipe) followingId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.followsService.follow(user.userId, followingId);
  }

  @Delete(':userId')
  unfollow(
    @Param('userId', ParseUUIDPipe) followingId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.followsService.unfollow(user.userId, followingId);
  }
}
