import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RefreshToken, User } from 'src/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import {
  ACCESS_TOKEN_PRIVATE_KEY,
  ACCESS_TOKEN_PUBLIC_KEY,
} from 'src/core/utils/key.util';
import { UsersService } from '../users/users.service';
import { RefreshTokenRepository } from './repository/refresh-token.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        privateKey: ACCESS_TOKEN_PRIVATE_KEY,
        publicKey: ACCESS_TOKEN_PUBLIC_KEY,
        signOptions: {
          algorithm: 'RS256',
          expiresIn: configService.get('jwt.accessToken.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'IRefreshTokenRepository',
      useClass: RefreshTokenRepository,
    },
    AuthService,
    UsersService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
