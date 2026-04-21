import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareersController } from './careers.controller';
import { CareersService } from './careers.service';
import { Career } from './entities/career.entity';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Career]), PostsModule],
  controllers: [CareersController],
  providers: [CareersService],
  exports: [CareersService],
})
export class CareersModule {}
