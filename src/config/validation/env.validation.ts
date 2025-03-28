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

  AWS_S3_BUCKET: Joi.string().required(),
  AWS_S3_REGION: Joi.string().required(),
  AWS_S3_ACCESS_KEY_ID: Joi.string().required(),
  AWS_S3_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_S3_URL: Joi.string().required(),
});
