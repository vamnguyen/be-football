import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get appConfig() {
    return {
      port: this.configService.get<number>('app.port'),
      apiPrefix: this.configService.get<string>('app.apiPrefix'),
    };
  }

  get corsConfig() {
    return {
      origin: this.configService.get<string[]>('cors.origin'),
      credentials: this.configService.get<boolean>('cors.credentials'),
    };
  }

  get databaseConfig() {
    return {
      type: this.configService.get<string>('database.type'),
      host: this.configService.get<string>('database.host'),
      port: this.configService.get<number>('database.port'),
      username: this.configService.get<string>('database.username'),
      password: this.configService.get<string>('database.password'),
      database: this.configService.get<string>('database.database'),
    };
  }

  get jwtConfig() {
    return {
      accessToken: {
        secret: this.configService.get<string>('jwt.accessToken.secret'),
        expiresIn: this.configService.get<string>('jwt.accessToken.expiresIn'),
      },
      refreshToken: {
        secret: this.configService.get<string>('jwt.refreshToken.secret'),
        expiresIn: this.configService.get<string>('jwt.refreshToken.expiresIn'),
      },
    };
  }
}
