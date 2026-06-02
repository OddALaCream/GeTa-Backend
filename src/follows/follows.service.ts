import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { buildUserSummary } from '../common/serializers/user-summary';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followsRepo: Repository<Follow>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getMine(userId: string) {
    const [followers, following] = await Promise.all([
      this.followsRepo.find({
        where: { followingId: userId },
        relations: ['follower', 'follower.profile', 'follower.profile.career'],
        order: { createdAt: 'DESC' },
      }),
      this.followsRepo.find({
        where: { followerId: userId },
        relations: ['following', 'following.profile', 'following.profile.career'],
        order: { createdAt: 'DESC' },
      }),
    ]);

    return {
      followers: followers.map((follow) => buildUserSummary(follow.follower)),
      following: following.map((follow) => buildUserSummary(follow.following)),
      counts: {
        followers: followers.length,
        following: following.length,
      },
    };
  }

  async getStats(userId: string) {
    const [followers, following] = await Promise.all([
      this.followsRepo.count({ where: { followingId: userId } }),
      this.followsRepo.count({ where: { followerId: userId } }),
    ]);

    return {
      followers,
      following,
    };
  }

  async getSuggestions(userId: string) {
    const following = await this.followsRepo.find({
      where: { followerId: userId },
    });

    const followingIds = new Set(following.map((item) => item.followingId));

    const users = await this.usersRepo.find({
      relations: ['profile', 'profile.career'],
      order: { createdAt: 'DESC' },
      take: 12,
    });

    return users
      .filter((user) => user.id !== userId)
      .map((user) => ({
        ...buildUserSummary(user),
        isFollowing: followingIds.has(user.id),
      }));
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const target = await this.usersRepo.findOne({
      where: { id: followingId },
      relations: ['profile', 'profile.career'],
    });

    if (!target) {
      throw new NotFoundException(`User with id "${followingId}" not found`);
    }

    const followerUser = await this.usersRepo.findOne({
      where: { id: followerId },
      relations: ['profile', 'profile.career'],
    });

    if (!followerUser) {
      throw new NotFoundException(`User with id "${followerId}" not found`);
    }

    const existing = await this.followsRepo.findOne({
      where: { followerId, followingId },
    });

    if (!existing) {
      const follow = this.followsRepo.create({ followerId, followingId });
      await this.followsRepo.save(follow);

      await this.notificationsService.create({
        recipientId: followingId,
        actorId: followerId,
        type: NotificationType.FOLLOW,
        message: `${followerUser.profile?.fullName || followerUser.email} empezó a seguirte`,
        link: `/profile/${followerId}`,
      });
    }

    return {
      message: existing ? 'Already following this user' : 'User followed successfully',
      isFollowing: true,
    };
  }

  async unfollow(followerId: string, followingId: string) {
    const existing = await this.followsRepo.findOne({
      where: { followerId, followingId },
    });

    if (existing) {
      await this.followsRepo.remove(existing);
    }

    return {
      message: existing
        ? 'User unfollowed successfully'
        : 'User was not being followed',
      isFollowing: false,
    };
  }
}
