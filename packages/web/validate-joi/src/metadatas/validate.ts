/* eslint-disable @typescript-eslint/no-redeclare */
import { Joi, makePropDecorator, ValueExtractor } from '@gabliam/core';
import { UseInterceptors } from '@gabliam/web-core';
import { ERRORS_MSGS, METADATA_KEY } from '../constants';
import { ValidateInterceptor } from '../validate';

export function isValidatorOptions(value: any): value is ValidatorOptions {
  return (
    typeof value === 'object' &&
    Object.prototype.hasOwnProperty.call(value, 'validator')
  );
}

export function isValidatorConstructor(
  value: any,
): value is ValidatorConstructor {
  return typeof value === 'function';
}

export interface Validator {
  params?: Joi.SchemaLike;
  headers?: Joi.SchemaLike;
  query?: Joi.SchemaLike;
  body?: Joi.SchemaLike;
}

export interface ValidatorOptions extends ValidatorOptionsConstructor {
  /**
   * If true, add ValidateSendErrorInterceptor and ValidateInterceptor to method
   * default: true
   */
  useInterceptors?: boolean;
}

export interface ValidatorOptionsConstructor {
  validator: Validator;

  options?: ValidationOptions;
}

export type ValidatorConstructor = (
  valueValidator: ValueExtractor,
) => Validator | ValidatorOptionsConstructor;

export type ValidatorType = keyof Validator;

export interface ValidationOptions extends Joi.ValidationOptions {
  escapeHtml?: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const DEFAULT_VAlIDATION_OPTIONS = {
  escapeHtml: true,
};

export const listParamToValidate: ValidatorType[] = [
  'headers',
  'params',
  'query',
  'body',
];

export const constructValidator = (
  validator: Validator | ValidatorOptions,
  options: ValidationOptions = {},
) => {
  const rules = new Map<ValidatorType, Joi.Schema>();

  let realValidator: Validator;
  if (isValidatorOptions(validator)) {
    realValidator = validator.validator;
    // eslint-disable-next-line no-param-reassign
    options = validator.options || {};
  } else {
    realValidator = validator;
  }

  const validationOptions = {
    ...DEFAULT_VAlIDATION_OPTIONS,
    ...options,
  };

  for (const paramToValidate of listParamToValidate) {
    if (realValidator[paramToValidate]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      rules.set(paramToValidate, Joi.compile(realValidator[paramToValidate]!));
    }
  }
  return { rules, validationOptions };
};

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
    validator: Validator | ValidatorOptions | ValidatorConstructor,
    options?: ValidationOptions,
    useInterceptors?: boolean,
  ): MethodDecorator;

  /**
   * see the `@Validate` decorator.
   */
  new (
    validator: Validator | ValidatorOptions | ValidatorConstructor,
    options?: ValidationOptions,
    useInterceptors?: boolean,
  ): any;
}

/**
 * `Validate` decorator and metadata.
 */
export interface Validate {
  rules?: Map<ValidatorType, Joi.Schema>;

  validatorCreator?: ValidatorConstructor;

  validationOptions: ValidationOptions;

  useInterceptors?: boolean;
}

export const Validate: ValidateDecorator = makePropDecorator(
  METADATA_KEY.validate,
  (
    validator: Validator | ValidatorOptions | ValidatorConstructor,
    options: ValidationOptions = {},
    useInterceptors = true,
  ): Validate => {
    if (isValidatorOptions(validator)) {
      // eslint-disable-next-line no-param-reassign
      useInterceptors = validator.useInterceptors ?? useInterceptors;
    }

    if (isValidatorConstructor(validator)) {
      return {
        rules: undefined,
        validatorCreator: validator,
        validationOptions: {},
        useInterceptors,
      };
    }

    return { ...constructValidator(validator, options), useInterceptors };
  },
  (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
    instance: Validate,
  ) => {
    if (instance.useInterceptors) {
      UseInterceptors(ValidateInterceptor)(target, propertyKey, descriptor);
    }
  },
  true,
  ERRORS_MSGS.DUPLICATED_VALIDATE_DECORATOR,
);
