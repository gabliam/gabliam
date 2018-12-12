import { METADATA_KEY } from '../constants';

export function ResponseBody(): MethodDecorator {
  return function(target: Object, propertyKey: string | symbol) {
    if (
      Reflect.hasOwnMetadata(
        METADATA_KEY.responseBody,
        target.constructor,
        propertyKey
      ) === true
    ) {
      return;
    }

    Reflect.defineMetadata(
      METADATA_KEY.responseBody,
      true,
      target.constructor,
      propertyKey
    );
  };
}
