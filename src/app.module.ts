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
      // 개발환경은 true
      synchronize: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: Number(process.env.JWT_REFRESH_EXPIRE),
    }),
    AuthModule,
    CommunityModule,
    CommentModule,
    UtilsModule,
    UserModule,
    SosModule,
  ],
})
export class AppModule {}
