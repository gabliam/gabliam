import { PARAMETER_TYPE, METADATA_KEY } from '../constants';
import { ControllerParameterMetadata, ParameterMetadata } from '../interfaces';

/**
 * Request decorator
 * Binds a method parameter to the request object.
 *
 * @param  {string} name name of specific request
 */
export const Request = paramDecoratorFactory(PARAMETER_TYPE.REQUEST);

/**
 * Response decorator
 * Binds a method parameter to the response object.
 *
 * @param  {string} name name of specific response
 */
export const Response = paramDecoratorFactory(PARAMETER_TYPE.RESPONSE);

/**
 * RequestParam decorator
 * Binds a method parameter to request.params object or to a specific parameter if a name is passed.
 *
 * @param  {string} name name of specific request.params
 */
export const RequestParam = paramDecoratorFactory(PARAMETER_TYPE.PARAMS);

/**
 * QueryParam decorator
 * Binds a method parameter to request.query or to a specific query parameter if a name is passed.
 *
 * @param  {string} name name of specific request.query
 */
export const QueryParam = paramDecoratorFactory(PARAMETER_TYPE.QUERY);

/**
 * RequestBody decorator
 *
 * Binds a method parameter to request.body or to a specific body property if a name is passed.
 * If the bodyParser middleware is not used on the koa app,
 * this will bind the method parameter to the koa request object.
 *
 * @param  {string} name name of specific body
 */
export const RequestBody = paramDecoratorFactory(PARAMETER_TYPE.BODY);

/**
 * RequestHeaders decorator
 *
 * Binds a method parameter to the request headers.
 *
 * @param  {string} name name of specific header
 */
export const RequestHeaders = paramDecoratorFactory(PARAMETER_TYPE.HEADERS);

/**
 * Cookies decorator
 *
 * Binds a method parameter to the request cookies.
 *
 * @param  {string} name name of specific cookie
 */
export const Cookies = paramDecoratorFactory(PARAMETER_TYPE.COOKIES);

/**
 * Next decorator
 *
 * Binds a method parameter to the next() function.
 */
export const Next = paramDecoratorFactory(PARAMETER_TYPE.NEXT);

function paramDecoratorFactory(
  parameterType: PARAMETER_TYPE
): (name?: string) => ParameterDecorator {
  return function(name: string = 'default'): ParameterDecorator {
    return Params(parameterType, name);
  };
}

/**
 * Params decorator
 *
 * generic decorator for params
 *
 * @param {PARAMETER_TYPE} type type of param
 * @param {string} parameterName name of param
 */
export function Params(
  type: PARAMETER_TYPE,
  parameterName: string
): ParameterDecorator {
  return function(
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    let metadataList: ControllerParameterMetadata = {};
    let parameterMetadataList: ParameterMetadata[] = [];
    const parameterMetadata: ParameterMetadata = {
      index: parameterIndex,
      parameterName: parameterName,
      type: type
    };
    if (
      !Reflect.hasOwnMetadata(
        METADATA_KEY.controllerParameter,
        target.constructor
      )
    ) {
      parameterMetadataList.unshift(parameterMetadata);
    } else {
      metadataList = Reflect.getOwnMetadata(
        METADATA_KEY.controllerParameter,
        target.constructor
      );
      if (metadataList.hasOwnProperty(propertyKey)) {
        parameterMetadataList = metadataList[propertyKey];
      }
      parameterMetadataList.unshift(parameterMetadata);
    }
    metadataList[propertyKey] = parameterMetadataList;
    Reflect.defineMetadata(
      METADATA_KEY.controllerParameter,
      metadataList,
      target.constructor
    );
  };
}
