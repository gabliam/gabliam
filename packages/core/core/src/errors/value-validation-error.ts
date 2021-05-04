import { Joi } from '../joi';

/**
 * Exception when validation of value fail
 */
export class ValueValidationError extends Error {
  constructor(msg: string, validationError: Joi.ValidationError) {
    // eslint-disable-next-line no-param-reassign
    msg += JSON.stringify(validationError);
    super(msg);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ValueValidationError.prototype);
  }
}
