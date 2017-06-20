import { injectable, register } from '@gabliam/core';
import {
  RabbitHandlerMetadata,
  HandlerType,
  RabbitHandlerOptions
} from '../interfaces';
import { TYPE, METADATA_KEY, ERRORS_MSGS } from '../constants';

export function RabbitController() {
  return function(target: any) {
    if (
      Reflect.hasOwnMetadata(METADATA_KEY.RabbitController, target) === true
    ) {
      throw new Error(ERRORS_MSGS.DUPLICATED_CONTROLLER_DECORATOR);
    }
    Reflect.defineMetadata(METADATA_KEY.RabbitController, true, target);
    injectable()(target);
    register(TYPE.RabbitController, { id: target, target })(target);
  };
}

export const RabbitListener = createRabbitHandlerDecorator('Listener');

export const RabbitComsumer = createRabbitHandlerDecorator('Consumer');

function createRabbitHandlerDecorator(type: HandlerType) {
  return function(queue: string, options: RabbitHandlerOptions = {}) {
    return function(target: any, key: string) {
      const metadata: RabbitHandlerMetadata = {
        type,
        queue,
        ...options,
        key
      };
      let metadataList: RabbitHandlerMetadata[] = [];
      if (
        !Reflect.hasOwnMetadata(METADATA_KEY.RabbitHandler, target.constructor)
      ) {
        Reflect.defineMetadata(
          METADATA_KEY.RabbitHandler,
          metadataList,
          target.constructor
        );
      } else {
        metadataList = Reflect.getOwnMetadata(
          METADATA_KEY.RabbitHandler,
          target.constructor
        );
      }

      metadataList.push(metadata);
    };
  };
}
