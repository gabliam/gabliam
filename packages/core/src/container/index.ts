import { Container } from 'inversify';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import { makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators';
import { makeValueMiddleware } from './valueMiddleware';

let container = new Container();

let middlewares = [];
if (process.env.NODE_ENV === 'development') {
    let logger = makeLoggerMiddleware();
    middlewares.push(logger);
}

middlewares.push(makeValueMiddleware(container));
container.applyMiddleware(...middlewares);

let provide: any = makeProvideDecorator(container);
let fluentProvider: any = makeFluentProvideDecorator(container);


export { container, provide, fluentProvider };
