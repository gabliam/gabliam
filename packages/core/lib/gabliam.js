"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require("express");
const constants_1 = require("./constants");
const loader_1 = require("./loader");
const container_1 = require("./container");
const registry_1 = require("./registry");
/**
 * Wrapper for the express server.
 */
class Gabliam {
    /**
     * Wrapper for the express server.
     *
     * @param container Container loaded with all controllers and their dependencies.
     */
    constructor(discoverPath, customRouter, routingConfig) {
        this.discoverPath = discoverPath;
        this._plugins = [];
        this.container = container_1.container;
        this._app = express();
        this._router = customRouter || express.Router();
        this._routingConfig = routingConfig || {
            rootPath: constants_1.DEFAULT_ROUTING_ROOT_PATH
        };
    }
    /**
     * Sets the configuration function to be applied to the application.
     * Note that the config function is not actually executed until a call to InversifyExpresServer.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level middleware can be registered.
     */
    setConfig(fn) {
        this._configFn = fn;
        return this;
    }
    /**
     * Sets the error handler configuration function to be applied to the application.
     * Note that the error config function is not actually executed until a call to InversifyExpresServer.build().
     *
     * This method is chainable.
     *
     * @param fn Function in which app-level error handlers can be registered.
     */
    setErrorConfig(fn) {
        this._errorConfigFn = fn;
        return this;
    }
    addPlugin(fn) {
        this._plugins.push(fn);
        return this;
    }
    /**
     * Applies all routes and configuration to the server, returning the express application.
     */
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            loader_1.loader(this.discoverPath);
            this._loadConfig();
            yield Promise.all(this._plugins.map(plugin => plugin(this)));
            // register server-level middleware before anything else
            if (this._configFn) {
                this._configFn.apply(undefined, [this._app]);
            }
            this.registerControllers();
            // register error handlers after controllers
            if (this._errorConfigFn) {
                this._errorConfigFn.apply(undefined, [this._app]);
            }
            return this._app;
        });
    }
    _loadConfig() {
        let configIds = registry_1.registry.get(constants_1.TYPE.Config);
        configIds.forEach(configId => {
            let confInstance = this.container.get(configId);
            let methodMetadata = Reflect.getOwnMetadata(constants_1.METADATA_KEY.Bean, confInstance.constructor);
            if (methodMetadata) {
                methodMetadata.forEach(metadata => {
                    this.container.bind(metadata.id).toConstantValue(confInstance[metadata.key]());
                });
            }
        });
    }
    registerControllers() {
        let controllerIds = registry_1.registry.get(constants_1.TYPE.Controller);
        controllerIds.forEach((controllerId) => {
            let controller = this.container.get(controllerId);
            let controllerMetadata = Reflect.getOwnMetadata(constants_1.METADATA_KEY.controller, controller.constructor);
            let methodMetadata = Reflect.getOwnMetadata(constants_1.METADATA_KEY.controllerMethod, controller.constructor);
            if (controllerMetadata && methodMetadata) {
                methodMetadata.forEach((metadata) => {
                    console.log(`${controllerMetadata.path}${metadata.path}`);
                    let handler = this.handlerFactory(controllerId, metadata.key, controllerMetadata.json);
                    this._router[metadata.method](`${controllerMetadata.path}${metadata.path}`, ...controllerMetadata.middlewares, ...metadata.middlewares, handler);
                });
            }
        });
        this._app.use(this._routingConfig.rootPath, this._router);
    }
    handlerFactory(controllerId, key, json) {
        return (req, res, next) => {
            let result = this.container.get(controllerId)[key](req, res, next);
            // try to resolve promise
            if (result && result instanceof Promise) {
                result.then((value) => {
                    if (value && !res.headersSent) {
                        if (json) {
                            res.json(value);
                        }
                        else {
                            res.send(value);
                        }
                    }
                })
                    .catch((error) => {
                    next(error);
                });
            }
            else if (result && !res.headersSent) {
                if (json) {
                    res.json(result);
                }
                else {
                    res.send(result);
                }
            }
        };
    }
}
exports.Gabliam = Gabliam;
