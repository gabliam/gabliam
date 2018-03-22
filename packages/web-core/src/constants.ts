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

export const DEFAULT_PARAM_VALUE = '**$$DEFAULT_PARAM_VALUE$$**';

export const ERRORS_MSGS = {
  DUPLICATED_CONTROLLER_DECORATOR: `Cannot apply @Controller and @RestController decorator multiple times.`
};
