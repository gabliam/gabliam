import * as _ from 'lodash';
import { interfaces } from 'inversify';
import * as Joi from 'joi';
import { ValueValidator } from './interfaces';
import { ValueValidationError } from './errors';
import { APP_CONFIG } from './constants';

/**
 * Validate a value
 * @param  {string} path
 * @param  {any} value
 * @param  {ValueValidator} validator
 */
function valueValidator(path: string, value: any, validator: ValueValidator) {
  const options: Joi.ValidationOptions = {
    abortEarly: false,
    ...validator.options || {}
  };
  const validate = Joi.validate(value, validator.schema, options);
  if (validate.error) {
    if (validator.throwError) {
      const msg = validator.customErrorMsg || `Error for '${path}' value`;
      throw new ValueValidationError(msg, validate.error);
    } else {
      return null;
    }
  }
  return validate.value;
}

/**
 * Create value extractor
 * @param  {Container} container
 */
export function configureValueExtractor(container: interfaces.Container) {
  /**
   * Get value in configuration
   * @param  {string} path
   * @param  {any} defaultValue
   * @param  {ValueValidator|null} validator?
   * @returns any
   */
  return (
    path: string,
    defaultValue: any,
    validator?: ValueValidator | null
  ): any => {
    try {
      const config = container.get<object>(APP_CONFIG);
      let value = _.get(config, path, defaultValue);
      if (validator) {
        value = valueValidator(path, value, validator);
      }
      return value;
    } catch (err) {
      if (err instanceof ValueValidationError) {
        throw err;
      }
    }
  };
}

export function isObject(val: any): val is Object {
  if (val === null || val === undefined) {
    return false;
  }
  return typeof val === 'function' || typeof val === 'object';
}
