import {
  PARAMETER_TYPE,
  METADATA_KEY,
  DEFAULT_PARAM_VALUE,
} from '../constants';
import {
  RabbitHandlerParameterMetadata,
  ParameterMetadata,
  SendOptions,
} from '../interfaces';
import { MessageFields, ConsumeMessageFields } from 'amqplib';

/**
 * Message decorator
 * Binds a method parameter to the message object.
 *
 */
export const Message = paramDecoratorFactory(PARAMETER_TYPE.MESSAGE);

/**
 * Content decorator
 * Binds a method parameter to the content object.
 *
 * @param  {string} name name of specific content
 */
export const Content = paramDecoratorFactory(PARAMETER_TYPE.CONTENT);

/**
 * Properties decorator
 * Binds a method parameter to properties object.
 *
 * @param  {string} name name of specific properties
 */
export const Properties = paramDecoratorFactory<keyof SendOptions>(
  PARAMETER_TYPE.PROPERTIES
);

/**
 * Fields decorator
 * Binds a method parameter to fields object
 *
 * @param  {string} name name of specific request.query
 */
export const Fields = paramDecoratorFactory<keyof (MessageFields & ConsumeMessageFields)>(
  PARAMETER_TYPE.FIELDS
);

function paramDecoratorFactory<T extends string>(
  parameterType: PARAMETER_TYPE
): (name?: T) => ParameterDecorator {
  return function(name): ParameterDecorator {
    let parameterName: T;
    if (name === undefined) {
      parameterName = <any>DEFAULT_PARAM_VALUE;
    } else {
      parameterName = name;
    }
    return Params(parameterType, parameterName);
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
export function Params<T extends string>(
  type: PARAMETER_TYPE,
  parameterName: T
): ParameterDecorator {
  return function(
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    let metadataList: RabbitHandlerParameterMetadata;
    let parameterMetadataList: ParameterMetadata[] = [];
    const parameterMetadata: ParameterMetadata = {
      index: parameterIndex,
      parameterName: parameterName,
      type: type,
    };

    if (
      !Reflect.hasOwnMetadata(
        METADATA_KEY.RabbitcontrollerParameter,
        target.constructor
      )
    ) {
      metadataList = new Map();
    } else {
      metadataList = Reflect.getOwnMetadata(
        METADATA_KEY.RabbitcontrollerParameter,
        target.constructor
      );
      if (metadataList.has(propertyKey)) {
        parameterMetadataList = metadataList.get(propertyKey)!;
      }
    }

    parameterMetadataList.unshift(parameterMetadata);
    metadataList.set(propertyKey, parameterMetadataList);
    Reflect.defineMetadata(
      METADATA_KEY.RabbitcontrollerParameter,
      metadataList,
      target.constructor
    );
  };
}
