import { METADATA_KEY, ERRORS_MSGS } from '../constants';
import {
  ValidateMetadata,
  Validator,
  ValidationOptions,
  ValidatorType,
  ValidatorOptions
} from '../interfaces';
import { Joi } from '@gabliam/core';
import { isValidatorOptions } from '..';

const DEFAULT_VAlIDATION_OPTIONS = {
  escapeHtml: true
};

export const listParamToValidate: ValidatorType[] = [
  'headers',
  'params',
  'query',
  'body'
];

export function Validate(
  validator: Validator | ValidatorOptions,
  options: ValidationOptions = {}
): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    if (
      Reflect.hasOwnMetadata(
        METADATA_KEY.validate,
        target.constructor,
        propertyKey
      ) === true
    ) {
      throw new Error(ERRORS_MSGS.DUPLICATED_VALIDATE_DECORATOR);
    }

    let realValidator: Validator;
    if (isValidatorOptions(validator)) {
      realValidator = validator.validator;
      options = validator.options || {};
    } else {
      realValidator = validator;
    }

    const validationOptions = {
      ...DEFAULT_VAlIDATION_OPTIONS,
      ...options
    };

    const rules = new Map<ValidatorType, Joi.Schema>();

    for (const paramToValidate of listParamToValidate) {
      if (realValidator[paramToValidate]) {
        rules.set(
          paramToValidate,
          Joi.compile(realValidator[paramToValidate]!)
        );
      }
    }

    const metadata: ValidateMetadata = { rules, validationOptions };
    Reflect.defineMetadata(
      METADATA_KEY.validate,
      metadata,
      target.constructor,
      propertyKey
    );
  };
}
