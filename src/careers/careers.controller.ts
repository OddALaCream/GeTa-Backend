import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { CareersService } from './careers.service';
import { PostsService } from '../posts/posts.service';
import { QueryPostsDto } from '../posts/dto/query-posts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('careers')
export class CareersController {
  constructor(
    private readonly careersService: CareersService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  findAll() {
    return this.careersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.careersService.findOne(id);
  }

  @Get(':id/posts')
  @UseGuards(JwtAuthGuard)
  getPostsByCareer(
    @Param('id', ParseUUIDPipe) careerId: string,
    @Query() query: QueryPostsDto,
  ) {
    return this.postsService.findAll({ ...query, careerId });
  }
}
