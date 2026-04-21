import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CareersModule } from './careers/careers.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const dbSync = configService.get<string>('DB_SYNC', 'false') === 'true';
        const dbSsl = configService.get<string>('DB_SSL', 'false') === 'true';

        return {
          type: 'postgres',
          ...(databaseUrl
            ? { url: databaseUrl }
            : {
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: Number(configService.get<string>('DB_PORT', '5432')),
                username: configService.get<string>('DB_USERNAME', 'postgres'),
                password: configService.get<string>('DB_PASSWORD', 'postgres'),
                database: configService.get<string>('DB_NAME', 'geta_cato'),
              }),
          ssl: dbSsl ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: dbSync,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProfilesModule,
    CareersModule,
    PostsModule,
    CommentsModule,
  ],
})
export class AppModule {}
