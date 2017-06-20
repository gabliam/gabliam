/** Type in registry */
export const TYPE = {
  Service: 'ServiceType',
  Config: 'ConfigType'
};

export const METADATA_KEY = {
  bean: '_bean',
  value: '_value',
  register: '_register',
  scan: '_scan',
  config: '_config',
  service: '_service'
};

export const ORDER_CONFIG = {
  Core: 50,
  Plugin: 100,
  Config: 150
};

export const ERRORS_MSGS = {
  DUPLICATED_CONFIG_DECORATOR: `Cannot apply @Config, @PluginConfig or @CorePlugin decorator multiple times.`,
  DUPLICATED_REGISTER_DECORATOR: `Cannot apply @register decorator multiple times.`,
  DUPLICATED_SERVICE_DECORATOR: `Cannot apply @Service decorator multiple times.`,
  INVALID_VALUE_DECORATOR: `Value must be a string or a ValueOptions.`
};

export const APP_CONFIG = Symbol('APP_CONFIG');

export const CORE_CONFIG = Symbol('CORE_CONFIG');

export const VALUE_EXTRACTOR = Symbol('ValueExtractor');
