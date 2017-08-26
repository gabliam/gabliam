import * as Joi from 'joi';

export const configurationValidator = Joi.object()
  .keys({
    uri: Joi.string(),
    host: Joi.string(),
    database_name: Joi.string(),
    port: Joi.number().default(27017),
    options: Joi.object()
  })
  .xor('uri', 'host')
  .and('host', 'database_name');
