import * as Joi from 'joi';

export const schemaQueueOptions = Joi.object().keys({
  exclusive: Joi.boolean(),
  durable: Joi.boolean(),
  autoDelete: Joi.boolean()
});

export const schemaQueueConfiguration = Joi.object().keys({
  queueName: Joi.string().trim().required(),
  options: schemaQueueOptions.default()
});

export const schemaPlugin = Joi.object()
  .pattern(/.*/, schemaQueueConfiguration)
  .min(1);
