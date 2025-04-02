import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message, User } from '@/entities';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { EditMessageDto } from './dto/edit-message.dto';
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post(':chatRoomId')
  async createMessage(
    @CurrentUser() user: User,
    @Param('chatRoomId') chatRoomId: string,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<void> {
    const newMessage = await this.messagesService.createMessage({
      user,
      chatRoomId,
      ...createMessageDto,
    });

    this.eventEmitter.emit('room.message.created', {
      message: newMessage,
      roomId: chatRoomId,
    });
  }

  @Get('room/:chatRoomId')
  getMessagesByRoom(
    @Param('chatRoomId') chatRoomId: string,
  ): Promise<Message[]> {
    return this.messagesService.getMessagesByRoom(chatRoomId);
  }

  @Patch('room/:chatRoomId/:messageId')
  async editMessage(
    @CurrentUser() user: User,
    @Param('chatRoomId') chatRoomId: string,
    @Param('messageId') messageId: string,
    @Body() editMessageDto: EditMessageDto,
  ): Promise<void> {
    const updatedMessage = await this.messagesService.editMessage({
      messageId,
      authorId: user.id,
      chatRoomId,
      content: editMessageDto.content,
    });

    this.eventEmitter.emit('room.message.updated', {
      message: updatedMessage,
      roomId: chatRoomId,
    });
  }

  @Delete('room/:chatRoomId/:messageId')
  async deleteMessage(
    @CurrentUser() user: User,
    @Param('chatRoomId') chatRoomId: string,
    @Param('messageId') messageId: string,
  ): Promise<void> {
    await this.messagesService.deleteMessage(chatRoomId, messageId);

    this.eventEmitter.emit('room.message.deleted', {
      messageId,
      roomId: chatRoomId,
    });
  }
}
