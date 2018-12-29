import { Value } from '../metadata';
import { reflection } from '../reflection';
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
      const valueMetadatas = reflection.propsOfMetadata<Value>(
        instance.constructor,
        Value
      );

      for (const [key, values] of Object.entries(valueMetadatas)) {
        if (values.length) {
          const [{ path, validator }] = values.slice(-1);
          const defaultValue = instance[key];
          instance[key] = valueExtractor(path, defaultValue, validator);
        }
      }
    }
    return instance;
  };
}
