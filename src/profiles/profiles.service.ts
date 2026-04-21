import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { Career } from '../careers/entities/career.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,
    @InjectRepository(Career)
    private readonly careersRepo: Repository<Career>,
  ) {}

  async findByUserId(userId: string): Promise<Profile> {
    const profile = await this.profilesRepo.findOne({
      where: { userId },
      relations: ['career', 'user'],
    });
    if (!profile) {
      throw new NotFoundException(`Profile for user "${userId}" not found`);
    }
    return profile;
  }

  async updateByUserId(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profilesRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException(`Profile for user "${userId}" not found`);
    }

    if (dto.careerId) {
      const career = await this.careersRepo.findOne({ where: { id: dto.careerId } });
      if (!career) {
        throw new NotFoundException(`Career with id "${dto.careerId}" not found`);
      }
    }

    Object.assign(profile, dto);
    return this.profilesRepo.save(profile);
  }
}
