import * as Joi from 'joi';

export const mongooseConfigurationValidator = Joi.object().keys({
    uri: Joi.when('host', { is: undefined, then: Joi.string().required() }),
    host: Joi.when('uri', { is: undefined, then: Joi.string().required() }),
    database_name: Joi.when('uri', { is: undefined, then: Joi.string().required() }),
    port: Joi.when('uri', { is: undefined, then: Joi.number() }),
    options: Joi.object(),
});
