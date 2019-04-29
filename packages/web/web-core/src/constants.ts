/** Type in registry */
export const TYPE = {
  Controller: 'ControllerType',
};

export const APP = Symbol('GABLIAM/WEB_APP');

export const REQUEST_LISTENER_CREATOR = Symbol(
  'GABLIAM/REQUEST_LISTENER_CREATOR'
);

export const SERVER = Symbol('GABLIAM/WEB_APP_SERVER');

export const SERVER_STARTER = Symbol('GABLIAM/WEB_APP_SERVER_STARTER');

export const WEB_PLUGIN_CONFIG = Symbol('GABLIAM/WEB_PLUGIN_CONFIG');

export const CONTEXT = Symbol('GABLIAM/WEB_CONTEXT');

export const METADATA_KEY = {
  controller: '_controller',
  controllerMethod: '_controller-method',
  controllerParameter: '_controller-parameter',
  webConfig: '_web-config',
  webConfigAfterControllers: '_web-config-after-controllers',
  interceptor: '_interceptor',
  pipe: '_pipe',
  validate: '_validate',
  responseBody: '_responseBody',
  specialInterceptor: '_specialInterceptor',
};

export enum PARAMETER_TYPE {
  EXEC_CONTEXT = 'ExecContext',
  CONTEXT = 'context',
  REQUEST = 'request',
  RESPONSE = 'response',
  PARAMS = 'params',
  QUERY = 'query',
  BODY = 'body',
  HEADERS = 'headers',
  COOKIES = 'cookies',
  NEXT = 'next',
}

export const ERRORS_MSGS = {
  DUPLICATED_CONTROLLER_DECORATOR: `Cannot apply @Controller and @RestController decorator multiple times.`,
  DUPLICATED_VALIDATE_DECORATOR: `Cannot apply @Validate decorator multiple times.`,
  DUPLICATED_CONFIG_DECORATOR: `Cannot apply @WebConfig or @WebConfigAfterControllers decorator multiple times on same method.`,
};
