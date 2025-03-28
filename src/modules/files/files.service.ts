import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { FileResponseDto } from './dto/file-response.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { FILE_TYPE } from '@/core/enums';
import { AvatarAttachment, MessageAttachment } from '@/entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(MessageAttachment)
    private readonly messageAttachmentRepository: Repository<MessageAttachment>,
    @InjectRepository(AvatarAttachment)
    private readonly avatarAttachmentRepository: Repository<AvatarAttachment>,
  ) {}

  private readonly s3Client = new S3Client({
    region: this.configService.get('s3.region'),
    credentials: {
      accessKeyId: this.configService.get('s3.accessKeyId'),
      secretAccessKey: this.configService.get('s3.secretAccessKey'),
    },
  });

  private async upload(
    file: Express.Multer.File,
    data: UploadFileDto,
  ): Promise<FileResponseDto> {
    const { type } = data;
    const key = `${Date.now().toString()}-${file.originalname}`;

    // Upload file to S3
    const putCommand = new PutObjectCommand({
      Bucket: this.configService.get('s3.bucket'),
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(putCommand);
    } catch (error) {
      console.log('Error uploading file to S3', error);
      throw new InternalServerErrorException('Error uploading file');
    }

    let newFile;
    switch (type) {
      case FILE_TYPE.MESSAGE:
        newFile = this.messageAttachmentRepository.create({
          key,
          url: `${this.configService.get('cloudfront.domain')}/${key}`,
          mimetype: file.mimetype,
        });
        await this.messageAttachmentRepository.save(newFile);
        break;
      case FILE_TYPE.AVATAR:
        newFile = this.avatarAttachmentRepository.create({
          key,
          url: `${this.configService.get('cloudfront.domain')}/${key}`,
          mimetype: file.mimetype,
        });
        await this.avatarAttachmentRepository.save(newFile);
        break;
      default:
        throw new ConflictException('Invalid file type');
    }

    if (!newFile) {
      throw new InternalServerErrorException('Error saving file');
    }

    return {
      id: newFile.id,
      key: newFile.key,
      url: newFile.url,
      mimetype: newFile.mimetype,
    };
  }

  async uploadFiles(
    files: Express.Multer.File[],
    data: UploadFileDto,
  ): Promise<FileResponseDto[]> {
    return Promise.all(files.map((file) => this.upload(file, data)));
  }

  private async deleteFile(key: string): Promise<void> {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.configService.get('s3.bucket'),
      Key: key,
    });

    try {
      await this.s3Client.send(deleteCommand);
    } catch (error) {
      console.log('Error deleting file', error);
      throw new InternalServerErrorException('Error deleting file');
    }
  }
}
