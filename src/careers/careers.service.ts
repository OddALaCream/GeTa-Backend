import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Career } from './entities/career.entity';

@Injectable()
export class CareersService {
  constructor(
    @InjectRepository(Career)
    private readonly careersRepo: Repository<Career>,
  ) {}

  findAll(): Promise<Career[]> {
    return this.careersRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Career> {
    const career = await this.careersRepo.findOne({ where: { id } });
    if (!career) {
      throw new NotFoundException(`Career with id "${id}" not found`);
    }
    return career;
  }
}
