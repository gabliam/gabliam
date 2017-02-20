/** Type in registry */
export const TYPE = {
    Controller: Symbol("Controller"),
    Service: Symbol("Service"),
    Config: Symbol("Config"),
};

export const METADATA_KEY = {
    controller: "_controller",
    controllerMethod: "_controller-method",
    Bean: "_bean",
};

export const DEFAULT_ROUTING_ROOT_PATH = "/";

export const APP_CONFIG = Symbol('APP_CONFIG');