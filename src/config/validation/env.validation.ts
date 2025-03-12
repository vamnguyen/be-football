import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(8000),
  API_PREFIX: Joi.string().default('api'),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),

  CORS_ORIGIN: Joi.string().required(),
  CORS_CREDENTIALS: Joi.boolean().required(),
});
