import { registerAs } from '@nestjs/config';

export const footballDataConfig = registerAs('footballData', () => ({
  apiKey: process.env.FOOTBALL_DATA_API_KEY,
  baseUrl: process.env.FOOTBALL_DATA_BASE_URL,
}));
