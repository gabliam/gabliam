import { interfaces } from 'inversify';
import { METADATA_KEY } from '../constants';
import { makeDecorator } from '../decorator';

/**
 * Type of the `Register` decorator / constructor function.
 */
export interface RegisterDecorator {
  /**
   * Decorator that marks a class that must be registered in Gabliam.
   *
   * In binding phase, plugins get classes which are registered.
   * Ex: Express plugin get all `@Controller` decorator
   */
  (obj: Register): ClassDecorator;

  /**
   * see the `@Config` decorator.
   */
  new (order?: number): any;
}

/**
 * `Register` decorator and metadata.
 */
export interface Register {
  id?: interfaces.ServiceIdentifier<any>;
  type: string;
  options?: any;
}

export const Register: RegisterDecorator = makeDecorator(
  METADATA_KEY.register,
  (obj: Register): Register => obj
);
