import {
  buildCareerSummary,
  buildUserSummary,
} from '../../common/serializers/user-summary';

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
