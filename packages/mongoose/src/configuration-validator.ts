import { Joi } from '@gabliam/core';

const mongooseValidator = Joi.object().keys({
  name: Joi.string(),
  uri: Joi.string().required(),
  options: Joi.object()
});

export const configurationValidator = Joi.alternatives(
  mongooseValidator,
  Joi.array().items(mongooseValidator)
);
