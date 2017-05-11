import { interfaces } from 'inversify';
import * as Joi from 'joi';

/**
 * Bean metadata
 */
export interface BeanMetadata {
  /**
   * Id of the bean
   */
  id: interfaces.ServiceIdentifier<any>;

  /**
   * Key of method
   */
  key: string;

  /**
   * Configuration class where the bean is
   */
  target: any;
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

export interface ValueMetadata {
  path: string;
  key: string;
  target: any;

  validator: ValueValidator | null;
}

export interface ValueRegistry {
  id: interfaces.ServiceIdentifier<any>;

  target: any;
}

export interface ConfigRegistry extends ValueRegistry {
  order: number;
}

export interface RegistryMetada {
  type: string | symbol;

  value: ValueRegistry;
}
