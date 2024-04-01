import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CommunityModule } from './community/community.module';
import { CommentModule } from './comment/comment.module';
import * as redisStore from 'cache-manager-ioredis';
import { UtilsModule } from './utils/utils.module';
import { UserModule } from './user/user.module';
import { SosModule } from './sos/sos.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity.{js,ts}'],
      synchronize: process.env.NODE_ENV === 'dev',
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    EmailModule,
    AuthModule,
    CommunityModule,
    SosModule,
    UtilsModule,
    UserModule,
    CommentModule,
  ],
})
export class AppModule {}
