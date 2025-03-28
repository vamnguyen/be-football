import { registerAs } from '@nestjs/config';

export const cloudfrontConfig = registerAs('cloudfront', () => ({
  domain: process.env.CLOUDFRONT_DOMAIN,
}));
