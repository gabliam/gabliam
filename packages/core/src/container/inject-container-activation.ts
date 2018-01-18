import { METADATA_KEY, INJECT_CONTAINER_KEY } from '../constants';
import { Container } from './container';
import { ContainerActivationHook } from './interfaces';

/**
 * make the injector activation
 *  Intercept all creation, if the class as a InjectContainerMetadata then inject the container
 */
export function makeActivationInject(
  container: Container
): ContainerActivationHook {
  return (instance: any) => {
    if (instance && instance.constructor) {
      const injectContainer = Reflect.hasMetadata(
        METADATA_KEY.injectContainer,
        instance.constructor
      );

      if (injectContainer) {
        Object.defineProperty(instance, INJECT_CONTAINER_KEY, {
          value: container
        });
      }
    }
    return instance;
  };
}
