import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
  ) {}

  async create(authorId: string, dto: CreateCommentDto): Promise<Comment> {
    const post = await this.postsRepo.findOne({
      where: { id: dto.postId, isDeleted: false },
    });
    if (!post) {
      throw new NotFoundException(`Post with id "${dto.postId}" not found`);
    }

    const comment = this.commentsRepo.create({ ...dto, authorId });
    return this.commentsRepo.save(comment);
  }

  findByPost(postId: string): Promise<Comment[]> {
    return this.commentsRepo.find({
      where: { postId, isDeleted: false },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, authorId: string, dto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.commentsRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }
    if (comment.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = dto.content;
    return this.commentsRepo.save(comment);
  }

  async remove(id: string, authorId: string): Promise<{ message: string }> {
    const comment = await this.commentsRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }
    if (comment.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    comment.isDeleted = true;
    await this.commentsRepo.save(comment);
    return { message: 'Comment deleted successfully' };
  }
}
