import { METADATA_KEY, ERRORS_MSGS } from '../constant';

/**
 * Add Cache on class
 */
export const CacheGroup = (cacheGroupName: string): ClassDecorator => <
  T extends Function
>(
  target: T
) => {
  if (Reflect.hasOwnMetadata(METADATA_KEY.cacheGroup, target) === true) {
    throw new Error(ERRORS_MSGS.DUPLICATED_CACHE_DECORATOR);
  }

  Reflect.defineMetadata(METADATA_KEY.cacheGroup, cacheGroupName, target);
};
