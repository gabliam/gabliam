import { Joi } from '@gabliam/core';

const mongooseValidator = Joi.object()
  .keys({
    name: Joi.string(),
    uri: Joi.string(),
    host: Joi.string(),
    database_name: Joi.string(),
    port: Joi.number().default(27017),
    options: Joi.object()
  })
  .xor('uri', 'host')
  .and('host', 'database_name');

export const configurationValidator = Joi.alternatives(
  mongooseValidator,
  Joi.array().items(mongooseValidator)
);
