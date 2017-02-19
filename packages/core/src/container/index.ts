import { Container, inject } from 'inversify';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import { makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators';

let container = new Container();

if (process.env.NODE_ENV === 'development') {
    let logger = makeLoggerMiddleware();
    container.applyMiddleware(logger);
}

let provide: any = makeProvideDecorator(container);
let fluentProvider: any = makeFluentProvideDecorator(container);


export { container, provide, fluentProvider, inject };