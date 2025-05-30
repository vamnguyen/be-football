import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import {
  appConfig,
  corsConfig,
  databaseConfig,
  jwtConfig,
  aiConfig,
  s3Config,
  cloudfrontConfig,
  footballDataConfig,
  redisConfig,
} from './config/configurations';
import { AppConfigService } from './config/config.service';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './modules/users/users.module';
import { PredictionsModule } from './modules/predictions/predictions.module';
import { MessagesModule } from './modules/messages/messages.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { FilesModule } from './modules/files/files.module';
import { validationSchema } from './config/validation/env.validation';
import { EventsModule } from './modules/events/events.module';
import { RedisModule } from './modules/redis/redis.module';
import { FootballDataModule } from './modules/football-data/football-data.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        appConfig,
        corsConfig,
        databaseConfig,
        jwtConfig,
        aiConfig,
        s3Config,
        cloudfrontConfig,
        footballDataConfig,
        redisConfig,
      ],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [__dirname + '/**/*.entity.{js,ts}'],
        synchronize: configService.get<boolean>('database.synchronize'),
        autoLoadEntities: true,
        logging: configService.get<boolean>('database.logging'),
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    PredictionsModule,
    MessagesModule,
    RoomsModule,
    FilesModule,
    EventsModule,
    RedisModule,
    FootballDataModule,
  ],
  providers: [
    AppConfigService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AppConfigService],
})
export class AppModule {}
