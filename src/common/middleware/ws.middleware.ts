import { Socket } from 'socket.io';
import { WsJwtGuard } from '@/common/guards/ws-jwt.guard';
import { AuthenticatedSocket } from '@/modules/events/types';
import { AuthService } from '@/modules/auth/auth.service';

export type SocketIOMiddleware = {
  (client: Socket, next: (err?: any) => void): void;
};

export const SocketAuthMiddleware = (
  authService: AuthService,
): SocketIOMiddleware => {
  return (client: AuthenticatedSocket, next: (err?: Error) => void) => {
    WsJwtGuard.validateToken(client, authService)
      .then(() => next())
      .catch((err) => next(err));
  };
};
