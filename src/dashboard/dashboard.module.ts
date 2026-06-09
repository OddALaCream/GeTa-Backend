import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from '../follows/entities/follow.entity';
import { Message } from '../messages/entities/message.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Post } from '../posts/entities/post.entity';
import { SavedPost } from '../posts/entities/saved-post.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      Post,
      SavedPost,
      Notification,
      Message,
      Follow,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
