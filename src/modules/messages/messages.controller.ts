import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message, User } from '@/entities';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post(':chatRoomId')
  createMessage(
    @CurrentUser() user: User,
    @Param('chatRoomId') chatRoomId: string,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    return this.messagesService.createMessage({
      user,
      chatRoomId,
      ...createMessageDto,
    });
  }

  @Get('room/:chatRoomId')
  getMessagesByRoom(
    @Param('chatRoomId') chatRoomId: string,
  ): Promise<Message[]> {
    return this.messagesService.getMessagesByRoom(chatRoomId);
  }
}
