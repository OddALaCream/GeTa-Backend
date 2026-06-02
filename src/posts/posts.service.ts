import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Career } from '../careers/entities/career.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { Comment } from '../comments/entities/comment.entity';
import { PostLike } from './entities/post-like.entity';
import { SavedPost } from './entities/saved-post.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import {
  buildCareerSummary,
  buildUserSummary,
} from '../common/serializers/user-summary';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeedCommentResponse {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  author: ReturnType<typeof buildUserSummary>;
}

export interface FeedPostResponse {
  id: string;
  authorId: string;
  careerId: string;
  content: string;
  mediaUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: ReturnType<typeof buildUserSummary>;
  career: ReturnType<typeof buildCareerSummary>;
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
  savedByCurrentUser: boolean;
  comments: FeedCommentResponse[];
  canEdit: boolean;
  canDelete: boolean;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(Career)
    private readonly careersRepo: Repository<Career>,
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(PostLike)
    private readonly likesRepo: Repository<PostLike>,
    @InjectRepository(SavedPost)
    private readonly savedPostsRepo: Repository<SavedPost>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    const career = await this.careersRepo.findOne({ where: { id: dto.careerId } });
    if (!career) {
      throw new NotFoundException(`Career with id "${dto.careerId}" not found`);
    }

    const author = await this.usersRepo.findOne({
      where: { id: authorId },
      relations: ['profile', 'profile.career'],
    });

    if (!author) {
      throw new NotFoundException(`User with id "${authorId}" not found`);
    }

    const post = this.postsRepo.create({ ...dto, authorId });
    const saved = await this.postsRepo.save(post);
    const created = await this.postsRepo.findOne({
      where: { id: saved.id },
      relations: ['author', 'author.profile', 'author.profile.career', 'career'],
    });

    return this.serializePost(created || { ...saved, author, career } as Post, authorId);
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
    const serialized = await this.serializePosts(data, currentUserId);

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

    return this.serializePosts(posts, userId);
  }

  async findOne(id: string, currentUserId: string) {
    const post = await this.findPostEntityOrFail(id);
    return this.serializePost(post, currentUserId);
  }

  async update(id: string, authorId: string, dto: UpdatePostDto) {
    const post = await this.findPostEntityOrFail(id);
    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    Object.assign(post, dto);
    const saved = await this.postsRepo.save(post);
    return this.serializePost(saved, authorId);
  }

  async remove(id: string, authorId: string): Promise<{ message: string }> {
    const post = await this.findPostEntityOrFail(id);
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

  async like(postId: string, userId: string) {
    const post = await this.findPostEntityOrFail(postId);
    const existing = await this.likesRepo.findOne({
      where: { postId, userId },
    });

    if (!existing) {
      const like = this.likesRepo.create({ postId, userId });
      await this.likesRepo.save(like);

      const actor = await this.usersRepo.findOne({
        where: { id: userId },
        relations: ['profile', 'profile.career'],
      });

      if (actor) {
        await this.notificationsService.create({
          recipientId: post.authorId,
          actorId: userId,
          type: NotificationType.LIKE,
          message: `${actor.profile?.fullName || actor.email} reaccionó a tu publicación`,
          link: `/home?view=feed&postId=${postId}`,
        });
      }
    }

    return {
      message: existing ? 'Post already liked' : 'Post liked successfully',
      post: await this.serializePost(post, userId),
    };
  }

  async unlike(postId: string, userId: string) {
    await this.findPostEntityOrFail(postId);

    const existing = await this.likesRepo.findOne({
      where: { postId, userId },
    });

    if (existing) {
      await this.likesRepo.remove(existing);
    }

    const post = await this.findPostEntityOrFail(postId);

    return {
      message: existing ? 'Post unliked successfully' : 'Post was not liked',
      post: await this.serializePost(post, userId),
    };
  }

  async save(postId: string, userId: string) {
    await this.findPostEntityOrFail(postId);

    const existing = await this.savedPostsRepo.findOne({
      where: { postId, userId },
    });

    if (!existing) {
      const savedPost = this.savedPostsRepo.create({ postId, userId });
      await this.savedPostsRepo.save(savedPost);
    }

    const post = await this.findPostEntityOrFail(postId);

    return {
      message: existing ? 'Post already saved' : 'Post saved successfully',
      post: await this.serializePost(post, userId),
    };
  }

  async unsave(postId: string, userId: string) {
    await this.findPostEntityOrFail(postId);

    const existing = await this.savedPostsRepo.findOne({
      where: { postId, userId },
    });

    if (existing) {
      await this.savedPostsRepo.remove(existing);
    }

    const post = await this.findPostEntityOrFail(postId);

    return {
      message: existing ? 'Post removed from saved posts' : 'Post was not saved',
      post: await this.serializePost(post, userId),
    };
  }

  private async findPostEntityOrFail(id: string) {
    const post = await this.postsRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['author', 'author.profile', 'author.profile.career', 'career'],
    });

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    return post;
  }

  private async serializePost(post: Post, currentUserId: string) {
    const [serialized] = await this.serializePosts([post], currentUserId);
    return serialized;
  }

  private async serializePosts(posts: Post[], currentUserId: string) {
    const postIds = posts.map((post) => post.id);

    if (postIds.length === 0) {
      return [];
    }

    const [comments, likes, savedPosts] = await Promise.all([
      this.commentsRepo.find({
        where: {
          postId: In(postIds),
          isDeleted: false,
        },
        relations: ['author', 'author.profile', 'author.profile.career'],
        order: { createdAt: 'ASC' },
      }),
      this.likesRepo.find({
        where: {
          postId: In(postIds),
        },
      }),
      this.savedPostsRepo.find({
        where: {
          postId: In(postIds),
          userId: currentUserId,
        },
      }),
    ]);

    const likesCount = new Map<string, number>();
    const likedPostIds = new Set<string>();
    const savedPostIds = new Set(savedPosts.map((savedPost) => savedPost.postId));
    const commentsByPost = new Map<string, FeedCommentResponse[]>();

    for (const like of likes) {
      likesCount.set(like.postId, (likesCount.get(like.postId) || 0) + 1);

      if (like.userId === currentUserId) {
        likedPostIds.add(like.postId);
      }
    }

    for (const comment of comments) {
      const serializedComment: FeedCommentResponse = {
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        content: comment.content,
        createdAt: comment.createdAt,
        author: buildUserSummary(comment.author),
      };

      const currentComments = commentsByPost.get(comment.postId) || [];
      currentComments.push(serializedComment);
      commentsByPost.set(comment.postId, currentComments);
    }

    return posts.map((post) => {
      const postComments = commentsByPost.get(post.id) || [];

      return {
        id: post.id,
        authorId: post.authorId,
        careerId: post.careerId,
        content: post.content,
        mediaUrl: post.mediaUrl,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: buildUserSummary(post.author),
        career: buildCareerSummary(post.career),
        likesCount: likesCount.get(post.id) || 0,
        commentsCount: postComments.length,
        likedByCurrentUser: likedPostIds.has(post.id),
        savedByCurrentUser: savedPostIds.has(post.id),
        comments: postComments,
        canEdit: post.authorId === currentUserId,
        canDelete: post.authorId === currentUserId,
      };
    });
  }
}
