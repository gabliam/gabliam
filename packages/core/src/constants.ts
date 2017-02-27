/** Type in registry */
export const TYPE = {
    Service: 'ServiceType',
    Config: 'ConfigType',
};

export const METADATA_KEY = {
    bean: '_bean',
    value: '_value',
};

export const ORDER_CONFIG = {
    Core: 50,
    Config: 100,
    Plugin: 150
};

export const APP_CONFIG = Symbol('APP_CONFIG');

export const CORE_CONFIG = Symbol('CORE_CONFIG');
