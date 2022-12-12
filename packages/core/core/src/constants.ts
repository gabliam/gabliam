/** Type in registry */
export const TYPE = {
  Service: 'ServiceType',
  Config: 'ConfigType',
  PreDestroy: 'PreDestroy',
};

export const METADATA_KEY = {
  bean: '_bean',
  onMissingBean: '_onMissingBean',
  init: '_init',
  beforeCreate: '_beforeCreate',
  value: '_value',
  register: '_register',
  scan: '_scan',
  config: '_config',
  service: '_service',
  plugin: '_plugin',
  injectContainer: '_inject_container',
  preDestroy: '_preDestroy',
};

/**
 * Inject container key in descriptor
 */
export const INJECT_CONTAINER_KEY = '$$container';

export const ORDER_CONFIG = {
  Core: 50,
  Plugin: 100,
  Config: 150,
};

export const ERRORS_MSGS = {
  DUPLICATED_DECORATOR: `Cannot apply decorator multiple times.`,
  DUPLICATED_CONFIG_DECORATOR: `Cannot apply @Config, @PluginConfig or @CorePlugin decorator multiple times.`,
  DUPLICATED_PLUGIN_DECORATOR: `Cannot apply @Plugin decorator multiple times.`,
  DUPLICATED_APPLICATION_DECORATOR: `Cannot apply @Application decorator multiple times.`,
};

export const APP_CONFIG = Symbol('APP_CONFIG');

export const CORE_CONFIG = Symbol('CORE_CONFIG');

export const VALUE_EXTRACTOR = Symbol('ValueExtractor');
