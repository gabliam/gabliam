import { KoaConfiguration } from './interfaces';

/**
 * Middleware Config
 *
 * This class is a storage of all middlewares
 */
export class MiddlewareConfig {
  private _middlewares: KoaConfiguration[] = [];

  addMiddleware(middleware: KoaConfiguration) {
    this._middlewares.push(middleware);
  }

  get middlewares() {
    return this._middlewares.slice();
  }
}
