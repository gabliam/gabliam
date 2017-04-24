/** Type in registry */
export const TYPE = {
    Service: 'ServiceType',
    Config: 'ConfigType',
};

export const METADATA_KEY = {
    bean: '_bean',
    value: '_value',
    register: '_register',
    scan: '_scan',
};

export const ORDER_CONFIG = {
    Core: 50,
    Plugin: 100,
    Config: 150,
};

export const APP_CONFIG = Symbol('APP_CONFIG');

export const CORE_CONFIG = Symbol('CORE_CONFIG');
