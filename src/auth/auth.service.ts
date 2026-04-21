import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Career } from '../careers/entities/career.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,
    @InjectRepository(Career)
    private readonly careersRepo: Repository<Career>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, fullName, careerId } = registerDto;

    if (!email.endsWith('@ucb.edu.bo')) {
      throw new BadRequestException('Only @ucb.edu.bo institutional emails are allowed');
    }

    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const career = await this.careersRepo.findOne({ where: { id: careerId } });
    if (!career) {
      throw new NotFoundException(`Career with id "${careerId}" not found`);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.usersRepo.create({ email, passwordHash });
    await this.usersRepo.save(user);

    const profile = this.profilesRepo.create({ userId: user.id, fullName, careerId });
    await this.profilesRepo.save(profile);

    const accessToken = this.generateToken(user);

    return { accessToken, user };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const accessToken = this.generateToken(user);

    return { accessToken, user };
  }

  async me(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.profilesRepo.findOne({
      where: { userId },
      relations: ['career'],
    });

    return { ...user, profile };
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
