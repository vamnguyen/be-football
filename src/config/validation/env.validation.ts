import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(8000),
  API_PREFIX: Joi.string().default('api'),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),

  CORS_ORIGIN: Joi.string().required(),
  CORS_CREDENTIALS: Joi.boolean().required(),

  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.number().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.number().required(),

  OPENROUTER_API_KEY: Joi.string().required(),
});
