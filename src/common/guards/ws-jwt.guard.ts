import { ExecutionContext } from '@nestjs/common';
import { Injectable, CanActivate } from '@nestjs/common';
import * as cookie from 'cookie';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthenticatedSocket } from '@/modules/events/types';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'ws') return true;

    const client = context.switchToWs().getClient<AuthenticatedSocket>();

    try {
      await WsJwtGuard.validateToken(client, this.authService);
      return true;
    } catch (error) {
      console.error('Token validation failed', error);
      return false;
    }
  }

  static async validateToken(
    client: AuthenticatedSocket,
    authService: AuthService,
  ): Promise<void> {
    const cookies = client.handshake.headers.cookie;
    const parsedCookies = cookie.parse(cookies);
    const accessToken = parsedCookies['accessToken'];

    const payload = await authService.verifyAccessToken(accessToken);

    client.user = await authService.getUserById(payload.id);
  }
}
