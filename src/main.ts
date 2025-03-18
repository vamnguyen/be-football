import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);
  const { appConfig } = configService;

  app.use(cookieParser());
  app.setGlobalPrefix(appConfig.apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors(configService.corsConfig);

  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(appConfig.port);
}
bootstrap();
