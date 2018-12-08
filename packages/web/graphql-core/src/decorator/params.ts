import {
  PARAMETER_TYPE,
  DEFAULT_PARAM_VALUE,
  METADATA_KEY,
} from '../constants';

/**
 * Represent all parameters metadata for a controller
 */
export type ControllerParameterMetadata = Map<
  string | symbol | number,
  ParameterMetadata[]
>;

/**
 * Parameter metadata
 */
export interface ParameterMetadata {
  /**
   * Parameter name
   */
  parameterName: string;

  /**
   * Index of the parameter
   */
  index: number;

  /**
   * Type of parameter
   */
  type: PARAMETER_TYPE;
}

/**
 * Context decorator
 *
 * Binds a method parameter to the context.
 */
export const Context = paramDecoratorFactory(PARAMETER_TYPE.CONTEXT);

/**
 * Source decorator
 * Binds a method parameter to the source.
 *
 * @param  {string} name name of specific request
 */
export const SourceGraphql = paramDecoratorFactory(PARAMETER_TYPE.SOURCE);

/**
 * Args decorator
 * Binds a method parameter to the Args object.
 *
 * @param  {string} name name of specific args
 */
export const Args = paramDecoratorFactory(PARAMETER_TYPE.ARGS);

/**
 * Info decorator
 * Binds a method parameter to the info object.
 *
 * @param  {string} name name of specific info
 */
export const InfoGraphql = paramDecoratorFactory(PARAMETER_TYPE.INFO);

function paramDecoratorFactory(
  parameterType: PARAMETER_TYPE
): (name?: string) => ParameterDecorator {
  return function(name: string = DEFAULT_PARAM_VALUE): ParameterDecorator {
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
    let metadataList: ControllerParameterMetadata;
    let parameterMetadataList: ParameterMetadata[] = [];
    const parameterMetadata: ParameterMetadata = {
      index: parameterIndex,
      parameterName: parameterName,
      type: type,
    };

    if (
      !Reflect.hasOwnMetadata(
        METADATA_KEY.controllerParameter,
        target.constructor
      )
    ) {
      metadataList = new Map();
    } else {
      metadataList = Reflect.getOwnMetadata(
        METADATA_KEY.controllerParameter,
        target.constructor
      );
      if (metadataList.has(propertyKey)) {
        parameterMetadataList = metadataList.get(propertyKey)!;
      }
    }

    parameterMetadataList.unshift(parameterMetadata);
    metadataList.set(propertyKey, parameterMetadataList);
    Reflect.defineMetadata(
      METADATA_KEY.controllerParameter,
      metadataList,
      target.constructor
    );
  };
}
