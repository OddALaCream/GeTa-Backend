import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { buildUserSummary } from '../common/serializers/user-summary';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getSummary(userId: string) {
    const unreadCount = await this.messagesRepo.count({
      where: { recipientId: userId, isRead: false },
    });

    return { unreadCount };
  }

  async getConversations(userId: string) {
    const messages = await this.messagesRepo.find({
      where: [{ senderId: userId }, { recipientId: userId }],
      relations: [
        'sender',
        'sender.profile',
        'sender.profile.career',
        'recipient',
        'recipient.profile',
        'recipient.profile.career',
      ],
      order: { createdAt: 'DESC' },
    });

    const conversations = new Map<
      string,
      {
        user: ReturnType<typeof buildUserSummary>;
        lastMessage: {
          id: string;
          content: string;
          createdAt: Date;
          senderId: string;
          recipientId: string;
          isRead: boolean;
        };
        unreadCount: number;
      }
    >();

    for (const message of messages) {
      const peer =
        message.senderId === userId ? message.recipient : message.sender;

      if (!peer) {
        continue;
      }

      const existing = conversations.get(peer.id);

      if (!existing) {
        conversations.set(peer.id, {
          user: buildUserSummary(peer),
          lastMessage: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            senderId: message.senderId,
            recipientId: message.recipientId,
            isRead: message.isRead,
          },
          unreadCount:
            message.recipientId === userId && !message.isRead ? 1 : 0,
        });
        continue;
      }

      if (message.recipientId === userId && !message.isRead) {
        existing.unreadCount += 1;
      }
    }

    return Array.from(conversations.values());
  }

  async getConversation(userId: string, peerId: string) {
    const peer = await this.usersRepo.findOne({
      where: { id: peerId },
      relations: ['profile', 'profile.career'],
    });

    if (!peer) {
      throw new NotFoundException(`User with id "${peerId}" not found`);
    }

    const messages = await this.messagesRepo.find({
      where: [
        { senderId: userId, recipientId: peerId },
        { senderId: peerId, recipientId: userId },
      ],
      relations: [
        'sender',
        'sender.profile',
        'sender.profile.career',
        'recipient',
        'recipient.profile',
        'recipient.profile.career',
      ],
      order: { createdAt: 'ASC' },
    });

    await this.messagesRepo.update(
      { senderId: peerId, recipientId: userId, isRead: false },
      { isRead: true },
    );

    return {
      user: buildUserSummary(peer),
      messages: messages.map((message) => ({
        id: message.id,
        content: message.content,
        isRead:
          message.recipientId === userId ? true : message.isRead,
        createdAt: message.createdAt,
        senderId: message.senderId,
        recipientId: message.recipientId,
        sender: buildUserSummary(message.sender),
        recipient: buildUserSummary(message.recipient),
      })),
    };
  }

  async sendMessage(senderId: string, dto: SendMessageDto) {
    if (senderId === dto.recipientId) {
      throw new BadRequestException('You cannot send a message to yourself');
    }

    const recipient = await this.usersRepo.findOne({
      where: { id: dto.recipientId },
      relations: ['profile', 'profile.career'],
    });

    if (!recipient) {
      throw new NotFoundException(
        `User with id "${dto.recipientId}" not found`,
      );
    }

    const sender = await this.usersRepo.findOne({
      where: { id: senderId },
      relations: ['profile', 'profile.career'],
    });

    if (!sender) {
      throw new NotFoundException(`User with id "${senderId}" not found`);
    }

    const message = this.messagesRepo.create({
      senderId,
      recipientId: dto.recipientId,
      content: dto.content,
    });

    const saved = await this.messagesRepo.save(message);

    await this.notificationsService.create({
      recipientId: dto.recipientId,
      actorId: senderId,
      type: NotificationType.MESSAGE,
      message: `${sender.profile?.fullName || sender.email} te envió un mensaje`,
      link: `/home?view=messages&userId=${senderId}`,
    });

    return {
      id: saved.id,
      content: saved.content,
      isRead: saved.isRead,
      createdAt: saved.createdAt,
      senderId: saved.senderId,
      recipientId: saved.recipientId,
      sender: buildUserSummary(sender),
      recipient: buildUserSummary(recipient),
    };
  }
}
