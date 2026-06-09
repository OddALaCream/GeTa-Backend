import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { Career } from '../careers/entities/career.entity';
import { Comment } from '../comments/entities/comment.entity';
import { PostLike } from './entities/post-like.entity';
import { SavedPost } from './entities/saved-post.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { PostFeedAssemblerService } from './services/post-feed-assembler.service';
import { PostLookupService } from './services/post-lookup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      Career,
      Comment,
      PostLike,
      SavedPost,
      User,
    ]),
    NotificationsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostFeedAssemblerService, PostLookupService],
  exports: [PostsService, PostFeedAssemblerService, PostLookupService],
})
export class PostsModule {}
