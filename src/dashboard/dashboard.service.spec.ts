import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  const profilesRepo = {
    findOne: jest.fn(),
  };
  const postsRepo = {
    count: jest.fn(),
  };
  const savedPostsRepo = {
    count: jest.fn(),
  };
  const notificationsRepo = {
    count: jest.fn(),
  };
  const messagesRepo = {
    count: jest.fn(),
  };
  const followsRepo = {
    count: jest.fn(),
  };

  let service: DashboardService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DashboardService(
      profilesRepo as any,
      postsRepo as any,
      savedPostsRepo as any,
      notificationsRepo as any,
      messagesRepo as any,
      followsRepo as any,
    );
  });

  it('builds an overview with metrics and a focus message', async () => {
    profilesRepo.findOne.mockResolvedValue({
      userId: 'user-1',
      fullName: 'Ana Perez',
      bio: 'Construyendo comunidad',
      avatarUrl: '',
      campus: 'La Paz',
      careerId: 'career-1',
      career: {
        id: 'career-1',
        name: 'Ingenieria de Sistemas',
        code: 'IS',
      },
      user: {
        email: 'ana@ucb.edu.bo',
      },
    });

    postsRepo.count.mockResolvedValueOnce(2).mockResolvedValueOnce(18);
    savedPostsRepo.count.mockResolvedValueOnce(5);
    notificationsRepo.count.mockResolvedValueOnce(3);
    messagesRepo.count.mockResolvedValueOnce(1);
    followsRepo.count.mockResolvedValueOnce(7).mockResolvedValueOnce(4);

    const result = await service.getOverview('user-1');

    expect(result.profile.fullName).toBe('Ana Perez');
    expect(result.metrics.pendingItems).toBe(4);
    expect(result.highlight.profileCompletion).toBe(67);
    expect(result.highlight.focusMessage).toContain('conversaciones pendientes');
  });

  it('prioritizes publishing guidance when there is no activity yet', async () => {
    profilesRepo.findOne.mockResolvedValue({
      userId: 'user-2',
      fullName: 'Luis',
      bio: '',
      avatarUrl: '',
      campus: 'La Paz',
      careerId: 'career-2',
      career: null,
      user: {
        email: 'luis@ucb.edu.bo',
      },
    });

    postsRepo.count.mockResolvedValueOnce(0).mockResolvedValueOnce(9);
    savedPostsRepo.count.mockResolvedValueOnce(0);
    notificationsRepo.count.mockResolvedValueOnce(0);
    messagesRepo.count.mockResolvedValueOnce(0);
    followsRepo.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

    const result = await service.getOverview('user-2');

    expect(result.highlight.focusMessage).toContain('Aun no publicaste nada');
    expect(result.highlight.profileCompletion).toBe(0);
  });

  it('throws when the profile does not exist', async () => {
    profilesRepo.findOne.mockResolvedValue(null);

    await expect(service.getOverview('missing-user')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
