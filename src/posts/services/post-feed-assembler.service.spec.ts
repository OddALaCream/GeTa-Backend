import { PostFeedAssemblerService } from './post-feed-assembler.service';

describe('PostFeedAssemblerService', () => {
  const commentsRepo = {
    find: jest.fn(),
  };
  const likesRepo = {
    find: jest.fn(),
  };
  const savedPostsRepo = {
    find: jest.fn(),
  };

  let service: PostFeedAssemblerService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PostFeedAssemblerService(
      commentsRepo as any,
      likesRepo as any,
      savedPostsRepo as any,
    );
  });

  it('aggregates likes, comments and saved state into feed posts', async () => {
    const createdAt = new Date('2026-01-01T12:00:00.000Z');
    const updatedAt = new Date('2026-01-01T13:00:00.000Z');

    const posts = [
      {
        id: 'post-1',
        authorId: 'user-1',
        careerId: 'career-1',
        content: 'Primer aporte',
        mediaUrl: null,
        createdAt,
        updatedAt,
        author: {
          id: 'user-1',
          email: 'ana@ucb.edu.bo',
          role: 'student',
          profile: {
            fullName: 'Ana',
            career: {
              id: 'career-1',
              name: 'Ingenieria de Sistemas',
              code: 'IS',
            },
          },
        },
        career: {
          id: 'career-1',
          name: 'Ingenieria de Sistemas',
          code: 'IS',
        },
      },
      {
        id: 'post-2',
        authorId: 'user-2',
        careerId: 'career-1',
        content: 'Segundo aporte',
        mediaUrl: null,
        createdAt,
        updatedAt,
        author: {
          id: 'user-2',
          email: 'carlos@ucb.edu.bo',
          role: 'student',
          profile: {
            fullName: 'Carlos',
            career: {
              id: 'career-1',
              name: 'Ingenieria de Sistemas',
              code: 'IS',
            },
          },
        },
        career: {
          id: 'career-1',
          name: 'Ingenieria de Sistemas',
          code: 'IS',
        },
      },
    ] as any;

    commentsRepo.find.mockResolvedValue([
      {
        id: 'comment-1',
        postId: 'post-1',
        authorId: 'user-2',
        content: 'Buen aporte',
        createdAt,
        author: {
          id: 'user-2',
          email: 'carlos@ucb.edu.bo',
          role: 'student',
          profile: {
            fullName: 'Carlos',
            career: {
              id: 'career-1',
              name: 'Ingenieria de Sistemas',
              code: 'IS',
            },
          },
        },
      },
    ]);
    likesRepo.find.mockResolvedValue([
      { postId: 'post-1', userId: 'user-1' },
      { postId: 'post-1', userId: 'user-3' },
      { postId: 'post-2', userId: 'user-4' },
    ]);
    savedPostsRepo.find.mockResolvedValue([{ postId: 'post-2', userId: 'user-1' }]);

    const result = await service.buildPosts(posts, 'user-1');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: 'post-1',
        likesCount: 2,
        commentsCount: 1,
        likedByCurrentUser: true,
        savedByCurrentUser: false,
        canEdit: true,
        canDelete: true,
      }),
    );
    expect(result[0].comments[0]).toEqual(
      expect.objectContaining({
        id: 'comment-1',
        content: 'Buen aporte',
      }),
    );
    expect(result[1]).toEqual(
      expect.objectContaining({
        id: 'post-2',
        likesCount: 1,
        commentsCount: 0,
        likedByCurrentUser: false,
        savedByCurrentUser: true,
        canEdit: false,
        canDelete: false,
      }),
    );
  });

  it('returns an empty array without touching repositories when there are no posts', async () => {
    const result = await service.buildPosts([], 'user-1');

    expect(result).toEqual([]);
    expect(commentsRepo.find).not.toHaveBeenCalled();
    expect(likesRepo.find).not.toHaveBeenCalled();
    expect(savedPostsRepo.find).not.toHaveBeenCalled();
  });
});
