import { METADATA_KEY } from '../constants';
import { ValueMetadata, ValueValidator } from '../interfaces';
import * as Joi from 'joi';


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
  return typeof obj === 'object' && obj.hasOwnProperty('schema') && !obj.hasOwnProperty('isJoi');
}

export type ValueReturn = (target: any, key: string) => void;

/**
 * @param  {ValueOptions} options options of decorator
 */
export function Value(options: ValueOptions): ValueReturn;
/**
 * @param  {string} path path of configuration
 * @param  {Joi.Schema} schema? Joi schema
 */
export function Value(path: string, schema?: Joi.Schema): ValueReturn;

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
 * ```
 * application:
 *      name: David
 *```
 *
 * ```
 *  class Gretter {
 *      @Value('application.name')
 *      private name:string;
 *
 *      constructor(){};
 *      greet() {
 *          return `Hello ${this.name} !`; //display Hello David
 *      }
 *  }
 *
 * ## Simple Example
 * Here is an example of a class that define a value without configuration
 *
 * class Gretter2 {
 *      @Value('application.name2')
 *      private name:string = 'Jean';
 *
 *      constructor(){};
 *      greet() {
 *          return `Hello ${this.name} !`; //display Hello Jean
 *      }
 *  }
 * ```
 *
 * @param  {any} value
 * @param  {Joi.Schema=null} schema
 */
export function Value(value: any, schema?: Joi.Schema): ValueReturn {
  return function (target: any, key: string) {
    if (typeof value === 'string') {
      valueProperty(value, schema, target, key);
    } else if (isValueOptions(value)) {
      valueProperty(value.path, value.validator, target, key);
    }
  };
}

function valueProperty(path: string, schema: Joi.Schema | ValueValidator | undefined, target: any, key: string) {
  let validator: ValueValidator | null = null;
  if (schema) {
    if (isValueValidator(schema)) {
      validator = {
        throwError: true,
        ...schema
      };
    } else {
      validator = { throwError: true, schema };
    }
  }
  const metadata: ValueMetadata = { path, target, key, validator };
  let metadataList: ValueMetadata[] = [];

  if (!Reflect.hasOwnMetadata(METADATA_KEY.value, target.constructor)) {
    Reflect.defineMetadata(METADATA_KEY.value, metadataList, target.constructor);
  } else {
    metadataList = Reflect.getOwnMetadata(METADATA_KEY.value, target.constructor);
  }

  metadataList.push(metadata);
}
