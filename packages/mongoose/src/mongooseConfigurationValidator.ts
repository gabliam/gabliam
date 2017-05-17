import * as Joi from 'joi';

export const mongooseConfigurationValidator = Joi.object().keys({
  uri: Joi.string(),
  host: Joi.string(),
  database_name: Joi.string(),
  port: Joi.number(),
  options: Joi.object(),
}).xor('uri', 'host').and('host', 'database_name');
