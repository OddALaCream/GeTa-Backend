import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  buildCareerSummary,
  buildUserSummary,
} from '../../common/serializers/user-summary';
import { Comment } from '../../comments/entities/comment.entity';
import { Post } from '../entities/post.entity';
import { PostLike } from '../entities/post-like.entity';
import { SavedPost } from '../entities/saved-post.entity';
import {
  FeedCommentResponse,
  FeedPostResponse,
} from '../types/feed-response.types';

@Injectable()
export class PostFeedAssemblerService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(PostLike)
    private readonly likesRepo: Repository<PostLike>,
    @InjectRepository(SavedPost)
    private readonly savedPostsRepo: Repository<SavedPost>,
  ) {}

  async buildPost(post: Post, currentUserId: string) {
    const [serializedPost] = await this.buildPosts([post], currentUserId);
    return serializedPost;
  }

  async buildPosts(posts: Post[], currentUserId: string) {
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

    return posts.map((post): FeedPostResponse => {
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
