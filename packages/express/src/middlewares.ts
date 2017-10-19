import { ExpressConfiguration } from './interfaces';

export class MiddlewareConfig {
  private _middlewares: ExpressConfiguration[] = [];

  private _errorMiddlewares: ExpressConfiguration[] = [];

  addMiddleware(middleware: ExpressConfiguration) {
    this._middlewares.push(middleware);
  }

  addErrorMiddleware(middleware: ExpressConfiguration) {
    this._errorMiddlewares.push(middleware);
  }

  get middlewares() {
    return this._middlewares.slice();
  }

  get errorMiddlewares() {
    return this._errorMiddlewares.slice();
  }
}
