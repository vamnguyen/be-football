import { registerAs } from '@nestjs/config';

export const aiConfig = registerAs('ai', () => ({
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
}));
