import { Joi } from '@gabliam/core';
import { UNDEFINED_VALUE } from './constants';

const queueOptionsValidator = Joi.object().keys({
  exclusive: Joi.boolean(),
  durable: Joi.boolean(),
  autoDelete: Joi.boolean(),
});

const queueConfigurationValidator = Joi.object().keys({
  queueName: Joi.string()
    .trim()
    .required(),
  options: queueOptionsValidator.default(),
});

const queuesValidor = Joi.object()
  .pattern(/.*/, queueConfigurationValidator)
  .min(1);

const connectionValidator = Joi.object().keys({
  name: Joi.string()
    .trim()
    .default('default'),
  url: Joi.string()
    .trim()
    .required(),
  undefinedValue: Joi.string()
    .trim()
    .default(UNDEFINED_VALUE),
  queues: queuesValidor,
});

export const configurationValidator = Joi.alternatives(
  connectionValidator,
  Joi.array().items(connectionValidator)
);
