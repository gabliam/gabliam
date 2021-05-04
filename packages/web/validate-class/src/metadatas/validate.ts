import { makePropAndAnnotationAndParamDecorator } from '@gabliam/core';
import { UsePipes, BadRequestException } from '@gabliam/web-core';
import { ClassTransformOptions } from 'class-transformer';
import { ValidationError, ValidatorOptions } from 'class-validator';
import { ERRORS_MSGS, METADATA_KEY } from '../constants';
import { ValidatePipe } from '../validate';

export type ValidationOptions = Partial<Validate>;

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
   *    @Validate()
   *    @Get('/')
   *    hello(@QueryParam('name') name: NameDto) {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (options?: ValidationOptions): any;

  /**
   * see the `@Validate` decorator.
   */
  new (options?: ValidationOptions): any;
}

/**
 * `Validate` decorator and metadata.
 */
export interface Validate {
  transform: boolean;
  disableErrorMessages: boolean;
  validatorOptions: ValidatorOptions;

  transformOptions: ClassTransformOptions;

  exceptionFactory: (
    errors: ValidationError[],
    disableErrorMessages: boolean,
  ) => any;
}

const defaultOptions: Validate = {
  transform: false,
  disableErrorMessages: false,
  validatorOptions: {
    validationError: {
      target: false,
    },
  },
  transformOptions: {},
  exceptionFactory: (
    errors: ValidationError[],
    disableErrorMessages: boolean,
  ) =>
    new BadRequestException(
      disableErrorMessages ? undefined : { validation: errors },
    ),
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Validate: ValidateDecorator = makePropAndAnnotationAndParamDecorator(
  METADATA_KEY.validate,
  (options: ValidationOptions = {}): Validate => ({
    ...defaultOptions,
    ...options,
  }),
  (cls, annotationInstance: Validate) => {
    UsePipes(new ValidatePipe(annotationInstance))(cls);
  },
  (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
    instance: Validate,
  ) => {
    UsePipes(new ValidatePipe(instance))(target, propertyKey, descriptor);
  },
  (
    target: Object,
    propertyKey: string | symbol,
    index: number,
    instance: Validate,
  ) => {
    UsePipes(new ValidatePipe(instance))(target, propertyKey, index);
  },
  true,
  ERRORS_MSGS.DUPLICATED_VALIDATE_DECORATOR,
);
