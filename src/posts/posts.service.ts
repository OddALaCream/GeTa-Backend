import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { SavedPost } from './entities/saved-post.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { PostFeedAssemblerService } from './services/post-feed-assembler.service';
import { PostLookupService } from './services/post-lookup.service';
import {
  FeedPostResponse,
  PaginatedResult,
} from './types/feed-response.types';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly likesRepo: Repository<PostLike>,
    @InjectRepository(SavedPost)
    private readonly savedPostsRepo: Repository<SavedPost>,
    private readonly postLookupService: PostLookupService,
    private readonly postFeedAssemblerService: PostFeedAssemblerService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    await Promise.all([
      this.postLookupService.findCareerOrFail(dto.careerId),
      this.postLookupService.findUserOrFail(authorId),
    ]);

    const post = this.postsRepo.create({ ...dto, authorId });
    const saved = await this.postsRepo.save(post);
    const created = await this.postLookupService.findPostOrFail(saved.id);

    return this.postFeedAssemblerService.buildPost(created, authorId);
  }

  async findAll(
    query: QueryPostsDto,
    currentUserId: string,
  ): Promise<PaginatedResult<FeedPostResponse>> {
    const { page = 1, limit = 20, careerId, authorId } = query;

    const qb = this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'authorProfile')
      .leftJoinAndSelect('authorProfile.career', 'authorCareer')
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
    const serialized = await this.postFeedAssemblerService.buildPosts(
      data,
      currentUserId,
    );

    return {
      data: serialized,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findSavedPosts(userId: string) {
    const savedPosts = await this.savedPostsRepo.find({
      where: { userId },
      relations: [
        'post',
        'post.author',
        'post.author.profile',
        'post.author.profile.career',
        'post.career',
      ],
      order: { createdAt: 'DESC' },
    });

    const posts = savedPosts
      .map((savedPost) => savedPost.post)
      .filter((post) => post && !post.isDeleted);

    return this.postFeedAssemblerService.buildPosts(posts, userId);
  }

  async findOne(id: string, currentUserId: string) {
    const post = await this.postLookupService.findPostOrFail(id);
    return this.postFeedAssemblerService.buildPost(post, currentUserId);
  }

  async update(id: string, authorId: string, dto: UpdatePostDto) {
    const post = await this.postLookupService.findPostOrFail(id);

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    Object.assign(post, dto);
    const saved = await this.postsRepo.save(post);

    return this.postFeedAssemblerService.buildPost(saved, authorId);
  }

  async remove(id: string, authorId: string): Promise<{ message: string }> {
    const post = await this.postLookupService.findPostOrFail(id);

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    post.isDeleted = true;
    await this.postsRepo.save(post);

    return { message: 'Post deleted successfully' };
  }

  async like(postId: string, userId: string) {
    const post = await this.postLookupService.findPostOrFail(postId);
    const existing = await this.likesRepo.findOne({
      where: { postId, userId },
    });

    if (!existing) {
      const like = this.likesRepo.create({ postId, userId });
      await this.likesRepo.save(like);

      const actor = await this.postLookupService.findUserOrFail(userId);

      await this.notificationsService.create({
        recipientId: post.authorId,
        actorId: userId,
        type: NotificationType.LIKE,
        message: `${actor.profile?.fullName || actor.email} reacciono a tu publicacion`,
        link: `/home?view=feed&postId=${postId}`,
      });
    }

    return {
      message: existing ? 'Post already liked' : 'Post liked successfully',
      post: await this.postFeedAssemblerService.buildPost(post, userId),
    };
  }

  async unlike(postId: string, userId: string) {
    await this.postLookupService.findPostOrFail(postId);

    const existing = await this.likesRepo.findOne({
      where: { postId, userId },
    });

    if (existing) {
      await this.likesRepo.remove(existing);
    }

    const post = await this.postLookupService.findPostOrFail(postId);

    return {
      message: existing ? 'Post unliked successfully' : 'Post was not liked',
      post: await this.postFeedAssemblerService.buildPost(post, userId),
    };
  }

  async save(postId: string, userId: string) {
    await this.postLookupService.findPostOrFail(postId);

    const existing = await this.savedPostsRepo.findOne({
      where: { postId, userId },
    });

    if (!existing) {
      const savedPost = this.savedPostsRepo.create({ postId, userId });
      await this.savedPostsRepo.save(savedPost);
    }

    const post = await this.postLookupService.findPostOrFail(postId);

    return {
      message: existing ? 'Post already saved' : 'Post saved successfully',
      post: await this.postFeedAssemblerService.buildPost(post, userId),
    };
  }

  async unsave(postId: string, userId: string) {
    await this.postLookupService.findPostOrFail(postId);

    const existing = await this.savedPostsRepo.findOne({
      where: { postId, userId },
    });

    if (existing) {
      await this.savedPostsRepo.remove(existing);
    }

    const post = await this.postLookupService.findPostOrFail(postId);

    return {
      message: existing ? 'Post removed from saved posts' : 'Post was not saved',
      post: await this.postFeedAssemblerService.buildPost(post, userId),
    };
  }
}
