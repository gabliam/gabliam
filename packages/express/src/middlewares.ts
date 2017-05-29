import { ExpressConfig } from './interfaces';

export class MiddlewareConfig {
  private _middlewares: ExpressConfig[] = [];

  private _errorMiddlewares: ExpressConfig[] = [];


  addMiddleware(middleware: ExpressConfig) {
    this._middlewares.push(middleware);
  }

  addErrorMiddleware(middleware: ExpressConfig) {
    this._errorMiddlewares.push(middleware);
  }

  get middlewares() {
    return this._middlewares.slice();
  }

  get errorMiddlewares() {
    return this._errorMiddlewares.slice();
  }
}
