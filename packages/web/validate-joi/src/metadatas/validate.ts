import { Joi, makePropDecorator } from '@gabliam/core';
import { UseInterceptors } from '@gabliam/web-core';
import { ERRORS_MSGS, METADATA_KEY } from '../constants';
import { ValidateInterceptor } from '../validate';

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

  /**
   * If true, add ValidateSendErrorInterceptor and ValidateInterceptor to method
   * default: true
   */
  useInterceptors?: boolean;
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

/**
 * Type of the `Validate` decorator / constructor function.
 */
export interface ValidateDecorator {
  /**
   * Decorator that marks a property to use a validator
   *
   * @usageNotes
   *
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Validate({
   *      query: {
   *        name: Joi.string().required()
   *      }
   *    })
   *    @Get('/')
   *    hello(@QueryParam('name') name: string) {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (
    validator: Validator | ValidatorOptions,
    options?: ValidationOptions,
    useInterceptors?: boolean
  ): MethodDecorator;

  /**
   * see the `@Validate` decorator.
   */
  new (
    validator: Validator | ValidatorOptions,
    options?: ValidationOptions,
    useInterceptors?: boolean
  ): any;
}

/**
 * `Validate` decorator and metadata.
 */
export interface Validate {
  rules: Map<ValidatorType, Joi.Schema>;

  validationOptions: ValidationOptions;

  useInterceptors?: boolean;
}

export const Validate: ValidateDecorator = makePropDecorator(
  METADATA_KEY.validate,
  (
    validator: Validator | ValidatorOptions,
    options: ValidationOptions = {},
    useInterceptors = true
  ): Validate => {
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

    return { rules, validationOptions, useInterceptors };
  },
  (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
    instance: Validate
  ) => {
    if (instance.useInterceptors) {
      UseInterceptors(ValidateInterceptor)(target, propertyKey, descriptor);
    }
  },
  true,
  ERRORS_MSGS.DUPLICATED_VALIDATE_DECORATOR
);
