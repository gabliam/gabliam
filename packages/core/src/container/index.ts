import { Container } from 'inversify';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import { makeValueMiddleware } from './value-middleware';

/**
 * Create the inversify container
 */
export function createContainer(): Container {
  const container = new Container();

  const middlewares = [];
  if (process.env.NODE_ENV === 'development') {
    const logger = makeLoggerMiddleware();
    middlewares.push(logger);
  }

  middlewares.push(makeValueMiddleware(container));
  container.applyMiddleware(...middlewares);
  return container;
}

export { Container };
