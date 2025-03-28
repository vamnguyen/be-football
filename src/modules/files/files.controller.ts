import {
  Controller,
  UseInterceptors,
  UploadedFiles,
  Post,
  Body,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResponseDto } from './dto/file-response.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('multiple')
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fileSize: 1024 * 1024 * 100 } }),
  )
  async uploadMultiple(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() data: UploadFileDto,
  ): Promise<FileResponseDto[]> {
    return this.filesService.uploadFiles(files, data);
  }
}
