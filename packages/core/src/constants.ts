/** Type in registry */
export const TYPE = {
    Controller: Symbol('Controller'),
    Service: Symbol('Service'),
    Config: Symbol('Config'),
};

export const METADATA_KEY = {
    controller: '_controller',
    controllerMethod: '_controller-method',
    bean: '_bean',
    value: '_value',
};

export const DEFAULT_ROUTING_ROOT_PATH = '/';

export const ORDER_CONFIG = {
    Core: 50,
    Config: 100,
    Plugin: 150
};

export const APP_CONFIG = Symbol('APP_CONFIG');

export const CORE_CONFIG = Symbol('CORE_CONFIG');
