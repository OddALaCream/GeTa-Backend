import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Profile } from '../profiles/entities/profile.entity';
import { Career } from '../careers/entities/career.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { PostLike } from '../posts/entities/post-like.entity';
import { SavedPost } from '../posts/entities/saved-post.entity';
import { Follow } from '../follows/entities/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      Career,
      Post,
      Comment,
      PostLike,
      SavedPost,
      Follow,
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
