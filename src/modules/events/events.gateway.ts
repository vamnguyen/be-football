import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from './types';
import { SocketAuthMiddleware } from '@/common/middleware/ws.middleware';
import { AuthService } from '../auth/auth.service';
import { GatewaySessionManager } from './gateway-session-manager';
import { OnEvent } from '@nestjs/event-emitter';
import { Message, User } from '@/entities';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly authService: AuthService,
    private readonly sessions: GatewaySessionManager,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: AuthenticatedSocket) {
    server.use(SocketAuthMiddleware(this.authService) as any);
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client ${client.user.id} connected`);
    this.sessions.setUserSocket(client.user.id, client);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client ${client.user.id} disconnected`);
    this.sessions.removeUserSocket(client.user.id);
  }

  @SubscribeMessage('onJoinRoom')
  userJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string },
  ) {
    client.join(`room-${payload.roomId}`);
    client.to(`room-${payload.roomId}`).emit('userJoinedRoom', {
      userId: client.user.id,
      firstName: client.user.firstName,
      lastName: client.user.lastName,
    });
  }

  @SubscribeMessage('onLeaveRoom')
  userLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string },
  ) {
    client.leave(`room-${payload.roomId}`);
    client.to(`room-${payload.roomId}`).emit('userLeftRoom', {
      userId: client.user.id,
      firstName: client.user.firstName,
      lastName: client.user.lastName,
    });
  }

  @SubscribeMessage('getRoomParticipants')
  async getRoomParticipants(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string },
  ) {
    const roomName = `room-${payload.roomId}`;
    const sockets = await this.server.in(roomName).fetchSockets();
    const count = sockets.length;

    this.server.to(roomName).emit('getRoomParticipants', count);
  }

  @SubscribeMessage('onTypingStart')
  userTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string; user: User },
  ) {
    const room = `room-${payload.roomId}`;

    client.to(room).emit('userTypingStart', {
      isTyping: true,
      user: payload.user,
    });
  }

  @SubscribeMessage('onTypingStop')
  userTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string; user: User },
  ) {
    const room = `room-${payload.roomId}`;

    client.to(room).emit('userTypingStop', {
      isTyping: false,
      user: payload.user,
    });
  }

  @OnEvent('room.message.created')
  handleMessageCreated(payload: { message: Message; roomId: string }) {
    this.server
      .to(`room-${payload.roomId}`)
      .emit('onRoomMessageCreated', payload);
  }

  @OnEvent('room.message.updated')
  handleMessageUpdated(payload: { message: Message; roomId: string }) {
    this.logger.log(`Message updated in room ${payload.roomId}`);
    this.server
      .to(`room-${payload.roomId}`)
      .emit('onRoomMessageUpdated', payload);
  }

  @OnEvent('room.message.deleted')
  handleMessageDeleted(payload: { message: Message; roomId: string }) {
    this.logger.log(`Message deleted in room ${payload.roomId}`);
    this.server
      .to(`room-${payload.roomId}`)
      .emit('onRoomMessageDeleted', payload);
  }
}
