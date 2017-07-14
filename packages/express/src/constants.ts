/** Type in registry */
export const TYPE = {
  Controller: 'ControllerType'
};

export const METADATA_KEY = {
  controller: '_controller',
  controllerMethod: '_controller-method',
  controllerParameter: '_controller-parameter',
  middleware: '_middleware',
  MiddlewareConfig: '_middlewareConfig',
  MiddlewareErrorConfig: '_middlewareErrorConfig'
};

export enum PARAMETER_TYPE {
  REQUEST,
  RESPONSE,
  PARAMS,
  QUERY,
  BODY,
  HEADERS,
  COOKIES,
  NEXT
}

export const DEFAULT_ROUTING_ROOT_PATH = '/';

export const EXPRESS_PLUGIN_CONFIG = Symbol('GABLIAM/EXPRESS_PLUGIN_CONFIG');

export const APP = Symbol('GABLIAM/EXPRESS_APP');
export const SERVER = Symbol('GABLIAM/EXPRESS_SERVER');

export const ERRORS_MSGS = {
  DUPLICATED_CONFIG_DECORATOR: `Cannot apply @ExpressConfig or @ExpressErrorConfig decorator multiple times on same method.`,
  DUPLICATED_CONTROLLER_DECORATOR: `Cannot apply @Controller and @RestController decorator multiple times.`
};
