import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvatarAttachment, MessageAttachment } from '@/entities';

@Module({
  imports: [TypeOrmModule.forFeature([MessageAttachment, AvatarAttachment])],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
