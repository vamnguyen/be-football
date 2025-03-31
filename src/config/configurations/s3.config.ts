import { registerAs } from '@nestjs/config';

export const s3Config = registerAs('s3', () => ({
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_S3_REGION,
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  url: process.env.AWS_S3_URL,
}));
