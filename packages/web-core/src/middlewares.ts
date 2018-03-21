import { Configuration } from './interfaces';

/**
 * Middleware Config
 *
 * This class is a storage of all middlewares
 */
export class MiddlewareConfig<T> {
  private _middlewares: Configuration<T>[] = [];

  private _errorMiddlewares: Configuration<T>[] = [];

  addMiddleware(middleware: Configuration<T>) {
    this._middlewares.push(middleware);
  }

  addErrorMiddleware(middleware: Configuration<T>) {
    this._errorMiddlewares.push(middleware);
  }

  get middlewares() {
    return this._middlewares.slice();
  }

  get errorMiddlewares() {
    return this._errorMiddlewares.slice();
  }
}
