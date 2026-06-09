import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../follows/entities/follow.entity';
import { Message } from '../messages/entities/message.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Post } from '../posts/entities/post.entity';
import { SavedPost } from '../posts/entities/saved-post.entity';
import { Profile } from '../profiles/entities/profile.entity';

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(SavedPost)
    private readonly savedPostsRepo: Repository<SavedPost>,
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,
    @InjectRepository(Follow)
    private readonly followsRepo: Repository<Follow>,
  ) {}

  async getOverview(userId: string) {
    const profile = await this.profilesRepo.findOne({
      where: { userId },
      relations: ['career', 'user'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user "${userId}" not found`);
    }

    const [
      myPosts,
      careerPosts,
      savedPosts,
      unreadNotifications,
      unreadMessages,
      followers,
      following,
    ] = await Promise.all([
      this.postsRepo.count({
        where: { authorId: userId, isDeleted: false },
      }),
      this.postsRepo.count({
        where: { careerId: profile.careerId, isDeleted: false },
      }),
      this.savedPostsRepo.count({
        where: { userId },
      }),
      this.notificationsRepo.count({
        where: { recipientId: userId, isRead: false },
      }),
      this.messagesRepo.count({
        where: { recipientId: userId, isRead: false },
      }),
      this.followsRepo.count({
        where: { followingId: userId },
      }),
      this.followsRepo.count({
        where: { followerId: userId },
      }),
    ]);

    const checklist: ChecklistItem[] = [
      {
        id: 'bio',
        title: 'Completa tu bio',
        description: 'Ayuda a que otros estudiantes entiendan tus intereses.',
        completed: Boolean(profile.bio?.trim()),
      },
      {
        id: 'avatar',
        title: 'Agrega un avatar',
        description: 'Tu perfil se reconoce mucho mas rapido con una imagen.',
        completed: Boolean(profile.avatarUrl?.trim()),
      },
      {
        id: 'first-post',
        title: 'Publica en tu comunidad',
        description: 'Comparte una idea, evento o recurso de tu carrera.',
        completed: myPosts > 0,
      },
    ];

    const completedChecklist = checklist.filter((item) => item.completed).length;
    const pendingItems = unreadNotifications + unreadMessages;
    const profileCompletion = Math.round(
      (completedChecklist / checklist.length) * 100,
    );

    return {
      profile: {
        fullName: profile.fullName,
        email: profile.user?.email || '',
        campus: profile.campus,
        career: profile.career
          ? {
              id: profile.career.id,
              name: profile.career.name,
              code: profile.career.code,
            }
          : null,
      },
      metrics: {
        myPosts,
        careerPosts,
        savedPosts,
        unreadNotifications,
        unreadMessages,
        followers,
        following,
        pendingItems,
      },
      checklist,
      highlight: {
        profileCompletion,
        engagementScore: myPosts + followers + following,
        focusMessage: this.buildFocusMessage({
          pendingItems,
          unreadMessages,
          unreadNotifications,
          myPosts,
          profileCompletion,
        }),
      },
    };
  }

  private buildFocusMessage(input: {
    pendingItems: number;
    unreadMessages: number;
    unreadNotifications: number;
    myPosts: number;
    profileCompletion: number;
  }) {
    if (input.unreadMessages > 0) {
      return 'Tienes conversaciones pendientes. Responder rapido mejora la interaccion.';
    }

    if (input.unreadNotifications > 0) {
      return 'Tu comunidad reacciono a tu actividad. Revisa las notificaciones recientes.';
    }

    if (input.myPosts === 0) {
      return 'Aun no publicaste nada. Un primer aporte ayuda a activar tu red.';
    }

    if (input.profileCompletion < 100) {
      return 'Tu perfil puede verse mas solido si completas los elementos pendientes.';
    }

    if (input.pendingItems === 0) {
      return 'Todo esta al dia. Es un buen momento para explorar nuevas conversaciones.';
    }

    return 'Tu actividad va bien. Sigue fortaleciendo tu presencia en GeTa.';
  }
}
