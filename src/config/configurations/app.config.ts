import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: process.env.PORT,
  apiPrefix: process.env.API_PREFIX,
  nodeEnv: process.env.NODE_ENV,
}));
