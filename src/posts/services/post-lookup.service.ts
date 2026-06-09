import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Career } from '../../careers/entities/career.entity';
import { User } from '../../users/entities/user.entity';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostLookupService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(Career)
    private readonly careersRepo: Repository<Career>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findPostOrFail(id: string) {
    const post = await this.postsRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['author', 'author.profile', 'author.profile.career', 'career'],
    });

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    return post;
  }

  async findCareerOrFail(id: string) {
    const career = await this.careersRepo.findOne({ where: { id } });

    if (!career) {
      throw new NotFoundException(`Career with id "${id}" not found`);
    }

    return career;
  }

  async findUserOrFail(id: string) {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ['profile', 'profile.career'],
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return user;
  }
}
