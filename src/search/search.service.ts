import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Career } from '../careers/entities/career.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Post } from '../posts/entities/post.entity';
import { Follow } from '../follows/entities/follow.entity';
import { buildCareerSummary, buildUserSummary } from '../common/serializers/user-summary';
import { PostFeedAssemblerService } from '../posts/services/post-feed-assembler.service';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,
    @InjectRepository(Career)
    private readonly careersRepo: Repository<Career>,
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(Follow)
    private readonly followsRepo: Repository<Follow>,
    private readonly postFeedAssemblerService: PostFeedAssemblerService,
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
    const enrichedPosts = await this.postFeedAssemblerService.buildPosts(
      posts,
      userId,
    );

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
}
