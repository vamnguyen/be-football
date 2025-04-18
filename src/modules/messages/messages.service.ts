import { Repository } from 'typeorm';
import { Message, MessageAttachment } from '@/entities';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMessageType } from './types/create-message.type';
import { RoomsService } from '../rooms/rooms.service';
import { EditMessageType } from './types/edit-message.type';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageAttachment)
    private readonly attachmentRepository: Repository<MessageAttachment>,
    private readonly roomService: RoomsService,
  ) {}

  async createMessage({
    user,
    content,
    chatRoomId,
    parentMessageId,
    attachments,
  }: CreateMessageType): Promise<Message> {
    let parentMessage: Message;

    const existingRoom = await this.roomService.getRoomById(chatRoomId);
    if (!existingRoom) {
      throw new NotFoundException('Room not found');
    }

    if (parentMessageId) {
      parentMessage = await this.messageRepository.findOne({
        where: { id: parentMessageId },
        relations: ['chatRoom'],
      });
      if (!parentMessage) {
        throw new NotFoundException('Parent message not found');
      }
      if (parentMessage.chatRoom.id !== chatRoomId) {
        throw new NotFoundException('Parent message not found in this room');
      }
    }

    if (!content && (!attachments || attachments.length === 0)) {
      throw new BadRequestException(
        'A message must have content or attachment',
      );
    }

    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        const existingAttachment = await this.attachmentRepository.findOneBy({
          id: attachment.id,
        });

        if (!existingAttachment) {
          throw new NotFoundException(
            `Attachment id: ${attachment.id} not found`,
          );
        }
      }
    } else {
      attachments = [];
    }

    const newMessage = this.messageRepository.create({
      author: user,
      chatRoom: existingRoom,
      content,
      attachments,
      parentMessage,
    });
    const savedMessage = await this.messageRepository.save(newMessage);

    return this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: [
        'author',
        'attachments',
        'parentMessage',
        'parentMessage.author',
        'parentMessage.attachments',
      ],
    });
  }

  async getMessagesByRoom(chatRoomId: string): Promise<Message[]> {
    return this.messageRepository.find({
      relations: [
        'author',
        'attachments',
        'parentMessage',
        'parentMessage.author',
        'parentMessage.attachments',
      ],
      where: { chatRoom: { id: chatRoomId }, isDeleted: false },
      order: { createdAt: 'ASC' },
    });
  }

  async editMessage({
    messageId,
    authorId,
    chatRoomId,
    content,
  }: EditMessageType): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: {
        id: messageId,
        chatRoom: { id: chatRoomId },
        author: { id: authorId },
      },
      relations: ['author', 'chatRoom'],
    });
    if (!message) throw new NotFoundException('Message not found');

    message.content = content;
    message.isEdited = true;
    return this.messageRepository.save(message);
  }

  async deleteMessage(chatRoomId: string, messageId: string): Promise<void> {
    if (!chatRoomId || !messageId) {
      throw new BadRequestException('chatRoomId and messageId are required');
    }

    const message = await this.messageRepository.findOne({
      where: {
        id: messageId,
        chatRoom: { id: chatRoomId },
      },
      relations: ['chatRoom'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.isDeleted = true;
    message.deletedAt = new Date();

    await this.messageRepository.save(message);
  }
}
