import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MessagesModule } from '../messages/messages.module';
import { EventsGateway } from './events.gateway';
import { GatewaySessionManager } from './gateway-session-manager';

@Module({
  imports: [AuthModule, MessagesModule],
  providers: [EventsGateway, GatewaySessionManager],
  exports: [EventsGateway],
})
export class EventsModule {}
