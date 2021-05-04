/* eslint-disable @typescript-eslint/no-redeclare */
import { interfaces } from 'inversify';
import { METADATA_KEY } from '../constants';
import { makeDecorator } from '../decorator';

type OptionnalOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  { [K in Keys]+?: Partial<Pick<T, K>> }[Keys];

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
  (obj: OptionnalOne<Register, 'autobind'>): ClassDecorator;

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

  autobind: boolean;
}

export const Register: RegisterDecorator = makeDecorator(
  METADATA_KEY.register,
  (obj: OptionnalOne<Register, 'autobind'>): Register => ({
    autobind: true,
    ...obj,
  }),
);
