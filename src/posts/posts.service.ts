import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Career } from '../careers/entities/career.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(Career)
    private readonly careersRepo: Repository<Career>,
  ) {}

  async create(authorId: string, dto: CreatePostDto): Promise<Post> {
    const career = await this.careersRepo.findOne({ where: { id: dto.careerId } });
    if (!career) {
      throw new NotFoundException(`Career with id "${dto.careerId}" not found`);
    }

    const post = this.postsRepo.create({ ...dto, authorId });
    return this.postsRepo.save(post);
  }

  async findAll(query: QueryPostsDto): Promise<PaginatedResult<Post>> {
    const { page = 1, limit = 20, careerId, authorId } = query;

    const qb = this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.career', 'career')
      .where('post.isDeleted = :isDeleted', { isDeleted: false });

    if (careerId) {
      qb.andWhere('post.careerId = :careerId', { careerId });
    }
    if (authorId) {
      qb.andWhere('post.authorId = :authorId', { authorId });
    }

    qb.orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['author', 'career'],
    });
    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
    return post;
  }

  async update(id: string, authorId: string, dto: UpdatePostDto): Promise<Post> {
    const post = await this.postsRepo.findOne({ where: { id, isDeleted: false } });
    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    Object.assign(post, dto);
    return this.postsRepo.save(post);
  }

  async remove(id: string, authorId: string): Promise<{ message: string }> {
    const post = await this.postsRepo.findOne({ where: { id, isDeleted: false } });
    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    post.isDeleted = true;
    await this.postsRepo.save(post);
    return { message: 'Post deleted successfully' };
  }
}
