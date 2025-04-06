import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { ChatRoom, User } from '@/entities';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ROLE } from '@/core/enums';
import {
  PaginationDto,
  PaginationResponseDto,
} from '@/core/dto/pagination.dto';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post(':matchId')
  createRoom(
    @CurrentUser() user: User,
    @Param('matchId') matchId: number,
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<ChatRoom> {
    if (user.role !== ROLE.ADMIN) {
      throw new BadRequestException('Bạn không có quyền tạo phòng chat');
    }
    return this.roomsService.createRoom(user, matchId, createRoomDto);
  }

  @Get(':roomId')
  getRoomById(@Param('roomId') roomId: string): Promise<ChatRoom> {
    return this.roomsService.getRoomById(roomId);
  }

  @Get()
  getRooms(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<ChatRoom>> {
    return this.roomsService.getRooms(paginationDto);
  }
}
