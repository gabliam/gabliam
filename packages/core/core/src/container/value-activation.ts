import { METADATA_KEY } from '../constants';
import { ValueMetadata } from '../interfaces';
import { configureValueExtractor } from '../utils';
import { Container } from './container';
import { ContainerActivationHook } from './interfaces';

/**
 *  Make  the value activation
 *  Intercept all creation, if the class as a Value decorator then inject the value
 */
export function makeActivationValue(
  container: Container
): ContainerActivationHook {
  const valueExtractor = configureValueExtractor(container);

  return (instance: any) => {
    if (instance && instance.constructor) {
      const valueMetadata: ValueMetadata[] = Reflect.getMetadata(
        METADATA_KEY.value,
        instance.constructor
      );

      if (valueMetadata) {
        valueMetadata.forEach(({ key, path, validator }) => {
          const defaultValue = instance[key];
          instance[key] = valueExtractor(path, defaultValue, validator);
        });
      }
    }
    return instance;
  };
}
