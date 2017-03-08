import * as Joi from 'joi';

export class ValueValidationError extends Error {
    constructor(msg: string, validationError: Joi.ValidationError) {
        msg += JSON.stringify(validationError);
        super(msg);
    }
}
