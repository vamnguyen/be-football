import { Repository } from 'typeorm';
import { ChatRoom, User } from '@/entities';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import {
  PaginationDto,
  PaginationResponseDto,
} from '@/core/dto/pagination.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly roomsRepository: Repository<ChatRoom>,
  ) {}

  async createRoom(
    user: User,
    matchId: number,
    createRoomDto: CreateRoomDto,
  ): Promise<ChatRoom> {
    const existingRoom = await this.roomsRepository.findOneBy({
      matchId,
    });
    if (existingRoom) {
      throw new ConflictException('Room already exists');
    }

    const room = this.roomsRepository.create({
      matchId,
      admin: user,
      ...createRoomDto,
    });
    return this.roomsRepository.save(room);
  }

  async getRooms(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<ChatRoom>> {
    const { page, limit } = paginationDto;

    const [rooms, total] = await this.roomsRepository
      .createQueryBuilder('rooms')
      .leftJoinAndSelect('rooms.match', 'match')
      .leftJoinAndSelect('match.league', 'league')
      .leftJoinAndSelect('rooms.users', 'users')
      .leftJoinAndSelect('rooms.messages', 'messages')
      .leftJoinAndSelect('messages.author', 'author')
      .leftJoinAndSelect('rooms.admin', 'admin')
      .orderBy('rooms.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: rooms,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRoomById(roomId: string): Promise<ChatRoom> {
    const room = await this.roomsRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.match', 'match')
      .leftJoinAndSelect('match.league', 'league')
      .where('room.id = :roomId', { roomId })
      .getOne();

    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async deleteRoom(roomId: string): Promise<void> {
    await this.roomsRepository.delete(roomId);
  }
}
