import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from './config/configurations/app.config';
import corsConfig from './config/configurations/cors.config';
import { validationSchema } from './config/validation/env.validation';
import databaseConfig from './config/configurations/database.config';
import { AppConfigService } from './config/config.service';
import { AuthModule } from './modules/auth/auth.module';
import jwtConfig from './config/configurations/jwt.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, corsConfig, databaseConfig, jwtConfig],
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
    AuthModule,
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
