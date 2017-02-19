"use strict";
const inversify_1 = require("inversify");
exports.inject = inversify_1.inject;
const inversify_logger_middleware_1 = require("inversify-logger-middleware");
const inversify_binding_decorators_1 = require("inversify-binding-decorators");
let container = new inversify_1.Container();
exports.container = container;
if (process.env.NODE_ENV === 'development') {
    let logger = inversify_logger_middleware_1.makeLoggerMiddleware();
    container.applyMiddleware(logger);
}
let provide = inversify_binding_decorators_1.makeProvideDecorator(container);
exports.provide = provide;
let fluentProvider = inversify_binding_decorators_1.makeFluentProvideDecorator(container);
exports.fluentProvider = fluentProvider;
