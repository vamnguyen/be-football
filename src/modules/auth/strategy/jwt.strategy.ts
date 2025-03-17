import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ITokenPayload } from 'src/core/interfaces/entities/token-payload.interface';
import { ACCESS_TOKEN_PUBLIC_KEY } from 'src/core/utils/key.util';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const accessToken: string = request?.cookies?.accessToken;
          if (accessToken) return accessToken;

          return ExtractJwt.fromAuthHeaderAsBearerToken()(request) as string;
        },
      ]),
      secretOrKey: ACCESS_TOKEN_PUBLIC_KEY,
      ignoreExpiration: false,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: ITokenPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.usersService.findById(payload.id);
    if (!user) throw new UnauthorizedException('User not found');

    return user;
  }
}
