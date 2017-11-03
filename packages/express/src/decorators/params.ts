import { PARAMETER_TYPE, METADATA_KEY } from '../constants';
import { ControllerParameterMetadata, ParameterMetadata } from '../interfaces';

export const Request = paramDecoratorFactory(PARAMETER_TYPE.REQUEST);
export const Response = paramDecoratorFactory(PARAMETER_TYPE.RESPONSE);
export const RequestParam = paramDecoratorFactory(PARAMETER_TYPE.PARAMS);
export const QueryParam = paramDecoratorFactory(PARAMETER_TYPE.QUERY);
export const RequestBody = paramDecoratorFactory(PARAMETER_TYPE.BODY);
export const RequestHeaders = paramDecoratorFactory(PARAMETER_TYPE.HEADERS);
export const Cookies = paramDecoratorFactory(PARAMETER_TYPE.COOKIES);
export const Next = paramDecoratorFactory(PARAMETER_TYPE.NEXT);

function paramDecoratorFactory(
  parameterType: PARAMETER_TYPE
): (name?: string) => ParameterDecorator {
  return function(name: string = 'default'): ParameterDecorator {
    return Params(parameterType, name);
  };
}

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
