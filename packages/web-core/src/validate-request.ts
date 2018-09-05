import { Joi } from '@gabliam/core';
import { ValidatorType, ValidationOptions } from './decorators';

export const NO_VALIDATION = Symbol('@gabliam/web-core/NO_VALIDATION');

export const VALIDATE_ERROR = Symbol('@gabliam/web-core/VALIDATE_ERROR');

export interface ValidationError extends Joi.ValidationError {
  _meta: { source: string };
  [VALIDATE_ERROR]: boolean;
}

export const isValidateError = (err: any) => {
  if (err != null && typeof err === 'object') {
    // eslint-disable-line eqeqeq
    return err[VALIDATE_ERROR] || false;
  }
  return false;
};

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
    (<any>error)[VALIDATE_ERROR] = true;
    (<any>error)._meta = { source };
    throw error;
  }

  return value;
};
