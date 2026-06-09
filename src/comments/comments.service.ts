import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { buildUserSummary } from '../common/serializers/user-summary';
import { PostLookupService } from '../posts/services/post-lookup.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly postLookupService: PostLookupService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(authorId: string, dto: CreateCommentDto) {
    const post = await this.postLookupService.findPostOrFail(dto.postId);

    const author = await this.usersRepo.findOne({
      where: { id: authorId },
      relations: ['profile', 'profile.career'],
    });

    if (!author) {
      throw new NotFoundException(`User with id "${authorId}" not found`);
    }

    const comment = this.commentsRepo.create({ ...dto, authorId });
    const saved = await this.commentsRepo.save(comment);

    await this.notificationsService.create({
      recipientId: post.authorId,
      actorId: authorId,
      type: NotificationType.COMMENT,
      message: `${author.profile?.fullName || author.email} comento tu publicacion`,
      link: `/home?view=feed&postId=${post.id}`,
    });

    return {
      id: saved.id,
      postId: saved.postId,
      authorId: saved.authorId,
      content: saved.content,
      createdAt: saved.createdAt,
      author: buildUserSummary(author),
    };
  }

  async findByPost(postId: string) {
    const comments = await this.commentsRepo.find({
      where: { postId, isDeleted: false },
      relations: ['author', 'author.profile', 'author.profile.career'],
      order: { createdAt: 'ASC' },
    });

    return comments.map((comment) => ({
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      content: comment.content,
      createdAt: comment.createdAt,
      author: buildUserSummary(comment.author),
    }));
  }

  async update(id: string, authorId: string, dto: UpdateCommentDto) {
    const comment = await this.commentsRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['author', 'author.profile', 'author.profile.career'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }

    if (comment.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = dto.content;
    const saved = await this.commentsRepo.save(comment);

    return {
      id: saved.id,
      postId: saved.postId,
      authorId: saved.authorId,
      content: saved.content,
      createdAt: saved.createdAt,
      author: buildUserSummary(comment.author),
    };
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
