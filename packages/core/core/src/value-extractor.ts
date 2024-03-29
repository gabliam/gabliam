import { ExpressionParser } from '@gabliam/expression';
import _ from 'lodash';
import { APP_CONFIG } from './constants';
import { Container } from './container';
import { ValueValidationError } from './errors';
import { ValueExtractor } from './interfaces';
import { Joi } from './joi';
import { ValueValidator } from './metadatas';

/**
 * Validate a value
 * @param  {string} path
 * @param  {any} value
 * @param  {ValueValidator} validator
 */
function valueValidator(path: string, value: any, validator: ValueValidator) {
  const options: Joi.ValidationOptions = {
    abortEarly: false,
    ...(validator.options || {}),
  };

  const validate = validator.schema.validate(value, options);
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
export function configureValueExtractor(container: Container): ValueExtractor {
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
    validator?: ValueValidator | null,
  ): any => {
    let value;
    const config = container.get<object>(APP_CONFIG);
    try {
      const expression = new ExpressionParser(config).parseExpression(path);
      value = expression.getValue();
      // eslint-disable-next-line no-empty
    } catch {}

    if (value === undefined) {
      value = _.get(config, path, defaultValue);
    }

    try {
      if (validator) {
        value = valueValidator(path, value, validator);
      }
    } catch (err) {
      if (err instanceof ValueValidationError) {
        throw err;
      }
    }
    return value;
  };
}
