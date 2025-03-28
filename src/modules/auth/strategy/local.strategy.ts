import { Strategy } from 'passport-local';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, email: string, password: string) {
    const user = await this.authService.validateLogin(email, password);
    if (!user) {
      throw new BadRequestException('Thông tin đăng nhập không chính xác');
    }
    return user;
  }
}
