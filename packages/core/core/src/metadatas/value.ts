import { METADATA_KEY } from '../constants';
import { makePropDecorator } from '../decorator';
import { InvalidValueDecoratorError } from '../errors';
import { Joi } from '../joi';

/**
 * Type of the `Value` decorator / constructor function.
 */
export interface ValueDecorator {
  /**
   * Value decorator
   *
   * Inject configuration in your property.
   * /!\ values are undefined in constructor
   *
   * If property has value on init, this is the default value if no configuration
   *  ## Simple Example
   * Here is an example of a class that define a value
   *
   * ```yml
   * application:
   *      name: David
   *```
   *
   * ```typescript
   *  class Gretter {
   *      @Value('application.name')
   *      private name:string;
   *
   *      constructor(){}
   *      greet() {
   *          return `Hello ${this.name} !`; //display Hello David
   *      }
   *  }
   * ```
   *
   * ## Simple Example
   * Here is an example of a class that define a value without configuration
   *
   * ```typescript
   * class Gretter2 {
   *      @Value('application.name2')
   *      private name:string = 'Jean';
   *
   *      constructor(){}
   *      greet() {
   *          return `Hello ${this.name} !`; //display Hello Jean
   *      }
   *  }
   * ```
   *
   * Here is an example of a class that define a value in constructor without configuration
   * ```typescript
   * class Gretter2 {
   *      @Value('application.name2')
   *      private name:string;
   *
   *      constructor(){
   *        this.name = 'Jean';
   *      }
   *      greet() {
   *          return `Hello ${this.name} !`; //display Hello Jean
   *      }
   *  }
   * ```
   */
  (value: string | ValueOptions, schema?: Joi.Schema): PropertyDecorator;

  /**
   * see the `@Bean` decorator.
   */
  new (value: string | ValueOptions, schema?: Joi.Schema): Value;
}

/**
 * Type of metadata for an `Value` property.
 */
export interface Value {
  /**
   * Path of configuration
   */
  path: string;

  /**
   * Value validator
   */
  validator: ValueValidator | null;
}

/**
 * Value validator
 *
 * For customize error
 */
export interface ValueValidator {
  /**
   * Joi Schema
   */
  schema: Joi.Schema;

  /**
   * Indicate if throw an error when validation fail
   * default: true
   */
  throwError?: boolean;

  /**
   * Error message if you want custom this
   */
  customErrorMsg?: string;

  /**
   * option of Joi
   * @see Joi.ValidationOptions
   */
  options?: Joi.ValidationOptions;
}

/**
 * Options for value decorator
 */
export interface ValueOptions {
  /**
   * Path of configuration
   */
  path: string;

  /**
   * validator of configuration
   * If validator is an Joi schema, throw an error when validation fail
   * If you want customize error, or disable throw error, use ValueValidator
   * @see Joi.Schema
   * @see ValueValidator
   */
  validator?: Joi.Schema | ValueValidator;
}

/**
 * Test if value is a ValueOptions
 * @param  {any} obj
 * @returns boolean
 */
function isValueOptions(obj: any): obj is ValueOptions {
  return typeof obj === 'object' && obj.hasOwnProperty('path');
}

/**
 * Test if value is ValueValidator
 * @param  {any} obj
 * @returns boolean
 */
function isValueValidator(obj: any): obj is ValueValidator {
  return (
    typeof obj === 'object' &&
    obj.hasOwnProperty('schema') &&
    !obj.hasOwnProperty('isJoi')
  );
}

export const Value: ValueDecorator = makePropDecorator(
  METADATA_KEY.value,
  (value: any, schema?: Joi.Schema): Value => {
    if (typeof value === 'string') {
      return valueProperty(value, schema);
    } else if (isValueOptions(value)) {
      return valueProperty(value.path, value.validator);
    } else {
      throw new InvalidValueDecoratorError();
    }
  }
);

function valueProperty(
  path: string,
  schema: Joi.Schema | ValueValidator | undefined
): Value {
  let validator: ValueValidator | null = null;
  if (schema) {
    if (isValueValidator(schema)) {
      validator = {
        throwError: true,
        ...schema,
      };
    } else {
      validator = { throwError: true, schema };
    }
  }

  return { path, validator };
}
