import { Container } from 'inversify';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import { makeValueMiddleware } from './valueMiddleware';

/**
 * Create the inversify container
 */
export function createContainer(): Container {
    let container = new Container();

    let middlewares = [];
    if (process.env.NODE_ENV === 'development') {
        let logger = makeLoggerMiddleware();
        middlewares.push(logger);
    }

    middlewares.push(makeValueMiddleware(container));
    container.applyMiddleware(...middlewares);
    return container;
}

export { Container };
