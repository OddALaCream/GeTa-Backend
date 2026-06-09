import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Profile } from '../profiles/entities/profile.entity';
import { Career } from '../careers/entities/career.entity';
import { Post } from '../posts/entities/post.entity';
import { Follow } from '../follows/entities/follow.entity';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, Career, Post, Follow]),
    PostsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
