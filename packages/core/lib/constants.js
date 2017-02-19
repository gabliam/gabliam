"use strict";
const TYPE = {
    Controller: Symbol("Controller"),
    Service: Symbol("Service"),
    Config: Symbol("Config")
};
exports.TYPE = TYPE;
const METADATA_KEY = {
    controller: "_controller",
    controllerMethod: "_controller-method",
    Bean: "_bean",
};
exports.METADATA_KEY = METADATA_KEY;
const DEFAULT_ROUTING_ROOT_PATH = "/";
exports.DEFAULT_ROUTING_ROOT_PATH = DEFAULT_ROUTING_ROOT_PATH;
