import { INJECT_CONTAINER_KEY } from '../constants';
import { InjectContainer } from '../metadata';
import { reflection } from '../reflection';
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
      const injectContainer = reflection.annotationsOfMetadata(
        instance.constructor,
        InjectContainer
      );

      if (injectContainer.length) {
        Object.defineProperty(instance, INJECT_CONTAINER_KEY, {
          value: container,
        });
      }
    }
    return instance;
  };
}
