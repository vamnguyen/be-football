import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT,
  apiPrefix: process.env.API_PREFIX,
  nodeEnv: process.env.NODE_ENV,
}));
