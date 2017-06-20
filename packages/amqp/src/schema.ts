import * as Joi from 'joi';

export const schemaQueueOptions = Joi.object().keys({
  exclusive: Joi.boolean().default(false),
  durable: Joi.boolean().default(true),
  autoDelete: Joi.boolean().default(false)
});

export const schemaQueueConfiguration = Joi.object().keys({
  queueName: Joi.string().trim().required(),
  options: schemaQueueOptions.default()
});

export const schemaPlugin = Joi.object()
  .pattern(/.*/, schemaQueueConfiguration)
  .min(1);
