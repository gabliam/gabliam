import { METADATA_KEY } from '../constants';

/**
 * InjectContainer decorator
 *
 * Inject container in class
 */
export function InjectContainer() {
  return function(target: any) {
    Reflect.defineMetadata(METADATA_KEY.injectContainer, true, target);
  };
}
