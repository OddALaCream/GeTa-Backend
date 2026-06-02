import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
} from './entities/notification.entity';
import { buildUserSummary } from '../common/serializers/user-summary';

export type CreateNotificationInput = {
  recipientId: string;
  actorId?: string | null;
  type: NotificationType;
  message: string;
  link?: string | null;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
  ) {}

  async create(input: CreateNotificationInput) {
    if (input.actorId && input.actorId === input.recipientId) {
      return null;
    }

    const notification = this.notificationsRepo.create({
      recipientId: input.recipientId,
      actorId: input.actorId ?? null,
      type: input.type,
      message: input.message,
      link: input.link ?? null,
    });

    return this.notificationsRepo.save(notification);
  }

  async findForUser(userId: string) {
    const notifications = await this.notificationsRepo.find({
      where: { recipientId: userId },
      relations: ['actor', 'actor.profile', 'actor.profile.career'],
      order: { createdAt: 'DESC' },
      take: 30,
    });

    return notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      message: notification.message,
      link: notification.link,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      actor: buildUserSummary(notification.actor),
    }));
  }

  async getSummary(userId: string) {
    const unreadCount = await this.notificationsRepo.count({
      where: { recipientId: userId, isRead: false },
    });

    return { unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationsRepo.findOne({
      where: { id, recipientId: userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with id "${id}" not found`);
    }

    notification.isRead = true;
    await this.notificationsRepo.save(notification);

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepo.update(
      { recipientId: userId, isRead: false },
      { isRead: true },
    );

    return { message: 'All notifications marked as read' };
  }
}
