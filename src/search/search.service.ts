import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Career } from '../careers/entities/career.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { PostLike } from '../posts/entities/post-like.entity';
import { SavedPost } from '../posts/entities/saved-post.entity';
import { Follow } from '../follows/entities/follow.entity';
import {
  buildCareerSummary,
  buildProfileSummary,
  buildUserSummary,
} from '../common/serializers/user-summary';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,
    @InjectRepository(Career)
    private readonly careersRepo: Repository<Career>,
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(PostLike)
    private readonly likesRepo: Repository<PostLike>,
    @InjectRepository(SavedPost)
    private readonly savedPostsRepo: Repository<SavedPost>,
    @InjectRepository(Follow)
    private readonly followsRepo: Repository<Follow>,
  ) {}

  async search(userId: string, query?: string) {
    const term = query?.trim();

    const [profiles, careers, posts, following] = await Promise.all([
      term
        ? this.profilesRepo.find({
            where: [
              { fullName: ILike(`%${term}%`) },
              { user: { email: ILike(`%${term}%`) } },
            ],
            relations: ['user', 'career'],
            take: 8,
          })
        : this.profilesRepo.find({
            relations: ['user', 'career'],
            take: 6,
            order: { createdAt: 'DESC' },
          }),
      term
        ? this.careersRepo.find({
            where: [{ name: ILike(`%${term}%`) }, { code: ILike(`%${term}%`) }],
            order: { name: 'ASC' },
            take: 8,
          })
        : this.careersRepo.find({
            order: { name: 'ASC' },
            take: 6,
          }),
      this.searchPosts(term),
      this.followsRepo.find({
        where: { followerId: userId },
      }),
    ]);

    const followingIds = new Set(following.map((item) => item.followingId));
    const enrichedPosts = await this.buildPostResults(posts, userId);

    return {
      query: term || '',
      users: profiles
        .filter((profile) => profile.user)
        .map((profile) => ({
          ...buildUserSummary({
            ...profile.user,
            profile,
          } as any),
          isFollowing: followingIds.has(profile.userId),
        })),
      careers: careers.map((career) => buildCareerSummary(career)),
      posts: enrichedPosts,
    };
  }

  private async searchPosts(term?: string) {
    const qb = this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'authorProfile')
      .leftJoinAndSelect('authorProfile.career', 'authorCareer')
      .leftJoinAndSelect('post.career', 'career')
      .where('post.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('post.createdAt', 'DESC')
      .take(8);

    if (term) {
      qb.andWhere(
        '(post.content ILIKE :term OR authorProfile.fullName ILIKE :term OR career.name ILIKE :term)',
        { term: `%${term}%` },
      );
    }

    return qb.getMany();
  }

  private async buildPostResults(posts: Post[], userId: string) {
    const postIds = posts.map((post) => post.id);

    if (postIds.length === 0) {
      return [];
    }

    const [comments, likes, savedPosts] = await Promise.all([
      this.commentsRepo.find({
        where: postIds.map((postId) => ({ postId, isDeleted: false })),
        relations: ['author', 'author.profile', 'author.profile.career'],
        order: { createdAt: 'ASC' },
      }),
      this.likesRepo.find({
        where: postIds.map((postId) => ({ postId })),
      }),
      this.savedPostsRepo.find({
        where: postIds.map((postId) => ({ postId, userId })),
      }),
    ]);

    const savedIds = new Set(savedPosts.map((item) => item.postId));
    const likesCount = new Map<string, number>();
    const likedPostIds = new Set<string>();
    const commentsByPost = new Map<string, Comment[]>();

    for (const like of likes) {
      likesCount.set(like.postId, (likesCount.get(like.postId) || 0) + 1);
      if (like.userId === userId) {
        likedPostIds.add(like.postId);
      }
    }

    for (const comment of comments) {
      const current = commentsByPost.get(comment.postId) || [];
      current.push(comment);
      commentsByPost.set(comment.postId, current);
    }

    return posts.map((post) => ({
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
      commentsCount: (commentsByPost.get(post.id) || []).length,
      likedByCurrentUser: likedPostIds.has(post.id),
      savedByCurrentUser: savedIds.has(post.id),
      comments: (commentsByPost.get(post.id) || []).map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        content: comment.content,
        createdAt: comment.createdAt,
        author: buildUserSummary(comment.author),
      })),
      authorProfile: buildProfileSummary(post.author?.profile),
    }));
  }
}
