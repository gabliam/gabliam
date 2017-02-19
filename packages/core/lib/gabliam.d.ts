/// <reference types="express" />
import * as express from "express";
import * as inversify from "inversify";
import * as interfaces from "./interfaces";
/**
 * Wrapper for the express server.
 */
export declare class Gabliam {
    discoverPath: string;
    private _plugins;
    private _router;
    container: inversify.interfaces.Container;
    private _app;
    private _configFn;
    private _errorConfigFn;
    private _routingConfig;
    /**
     * Wrapper for the express server.
     *
     * @param container Container loaded with all controllers and their dependencies.
     */
    constructor(discoverPath: string, customRouter?: express.Router, routingConfig?: interfaces.RoutingConfig);
    /**
     * Sets the configuration function to be applied to the application.
     * Note that the config function is not actually executed until a call to InversifyExpresServer.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level middleware can be registered.
     */
    setConfig(fn: interfaces.ConfigFunction): Gabliam;
    /**
     * Sets the error handler configuration function to be applied to the application.
     * Note that the error config function is not actually executed until a call to InversifyExpresServer.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level error handlers can be registered.
     */
    setErrorConfig(fn: interfaces.ConfigFunction): Gabliam;
    addPlugin(fn: interfaces.ModuleFunction): Gabliam;
    /**
     * Applies all routes and configuration to the server, returning the express application.
     */
    build(): Promise<express.Application>;
    private _loadConfig();
    private registerControllers();
    private handlerFactory(controllerId, key, json);
}
