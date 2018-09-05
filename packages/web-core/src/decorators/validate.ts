import { METADATA_KEY, ERRORS_MSGS } from '../constants';
import { Joi } from '@gabliam/core';

export function isValidatorOptions(value: any): value is ValidatorOptions {
  return typeof value === 'object' && value.hasOwnProperty('validator');
}

export interface Validator {
  params?: Joi.SchemaLike;
  headers?: Joi.SchemaLike;
  query?: Joi.SchemaLike;
  body?: Joi.SchemaLike;
}

export interface ValidatorOptions {
  validator: Validator;

  options?: ValidationOptions;
}

export interface ValidateMetadata {
  rules: Map<ValidatorType, Joi.Schema>;

  validationOptions: ValidationOptions;
}

export type ValidatorType = keyof Validator;

export interface ValidationOptions extends Joi.ValidationOptions {
  escapeHtml?: boolean;
}

const DEFAULT_VAlIDATION_OPTIONS = {
  escapeHtml: true,
};

export const listParamToValidate: ValidatorType[] = [
  'headers',
  'params',
  'query',
  'body',
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
      ...options,
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
