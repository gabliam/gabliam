import { Joi } from '@gabliam/core';
import { ValidationError } from '../errors';
import { ValidationOptions, ValidatorType } from '../metadatas';

export const NO_VALIDATION = Symbol('@gabliam/web-core/NO_VALIDATION');

export const createValidateRequest = (
  rules: Map<ValidatorType, Joi.Schema>,
  options: ValidationOptions
) => (source: ValidatorType, val: any) => {
  const spec = rules.get(source);
  if (!spec) {
    return NO_VALIDATION;
  }

  const { value, error } = spec.validate(val, options);
  if (error) {
    throw new ValidationError(error, source, options);
  }

  return value;
};
