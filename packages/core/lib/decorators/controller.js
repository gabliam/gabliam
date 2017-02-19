"use strict";
const constants_1 = require("../constants");
const container_1 = require("../container");
const registry_1 = require("../registry");
function Controller(options) {
    return function (target) {
        decorateController(options, target, false);
    };
}
exports.Controller = Controller;
function RestController(options) {
    return function (target) {
        decorateController(options, target, true);
    };
}
exports.RestController = RestController;
function decorateController(options, target, json) {
    let path;
    let id = target;
    let middlewares = [];
    if (typeof options === 'string') {
        path = options;
    }
    else {
        path = options.path;
        middlewares = options.middlewares;
        if (options.name) {
            id = name;
        }
    }
    let metadata = { path, middlewares, target, json };
    Reflect.defineMetadata(constants_1.METADATA_KEY.controller, metadata, target);
    container_1.fluentProvider(id)
        .inSingletonScope()
        .done()(target);
    registry_1.registry.add(constants_1.TYPE.Controller, id);
}
function All(path, ...middlewares) {
    return Method("all", path, ...middlewares);
}
exports.All = All;
function Get(path, ...middlewares) {
    return Method("get", path, ...middlewares);
}
exports.Get = Get;
function Post(path, ...middlewares) {
    return Method("post", path, ...middlewares);
}
exports.Post = Post;
function Put(path, ...middlewares) {
    return Method("put", path, ...middlewares);
}
exports.Put = Put;
function Patch(path, ...middlewares) {
    return Method("patch", path, ...middlewares);
}
exports.Patch = Patch;
function Head(path, ...middlewares) {
    return Method("head", path, ...middlewares);
}
exports.Head = Head;
function Delete(path, ...middlewares) {
    return Method("delete", path, ...middlewares);
}
exports.Delete = Delete;
function Method(method, path, ...middlewares) {
    return function (target, key, value) {
        let metadata = { path, middlewares, method, target, key };
        let metadataList = [];
        if (!Reflect.hasOwnMetadata(constants_1.METADATA_KEY.controllerMethod, target.constructor)) {
            Reflect.defineMetadata(constants_1.METADATA_KEY.controllerMethod, metadataList, target.constructor);
        }
        else {
            metadataList = Reflect.getOwnMetadata(constants_1.METADATA_KEY.controllerMethod, target.constructor);
        }
        metadataList.push(metadata);
    };
}
exports.Method = Method;
