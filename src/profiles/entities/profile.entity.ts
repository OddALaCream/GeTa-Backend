import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Career } from '../../careers/entities/career.entity';

export enum Campus {
  LA_PAZ = 'La Paz',
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  fullName: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'enum', enum: Campus, default: Campus.LA_PAZ })
  campus: Campus;

  @Column()
  careerId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Career, { eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'careerId' })
  career: Career;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
