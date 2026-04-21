import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { Profile } from './entities/profile.entity';
import { Career } from '../careers/entities/career.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, Career])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
