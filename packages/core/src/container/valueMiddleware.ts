import { interfaces, Container } from 'inversify';
import { METADATA_KEY } from '../constants';
import { ValueMetadata } from '../interfaces';
import { valueExtractor } from '../utils';


/**
 *  Make  the value middleware
 *  Intercept all creation, if the class as a Value decorator then inject the value
 * @param  {Container} container
 */
export function makeValueMiddleware(container: Container) {
  const getValue = valueExtractor(container);

  return function ValueMiddleware(next: interfaces.Next): interfaces.Next {
    return (args: interfaces.NextArgs) => {
      let results: any = null;
      results = next(args);

      if (results && results.constructor) {
        const valueMetadata: ValueMetadata[] = Reflect.getOwnMetadata(
          METADATA_KEY.value,
          results.constructor
        );

        if (valueMetadata) {
          valueMetadata.forEach(({ key, path, validator }) => {
            const defaultValue = results[key];
            results[key] = getValue(path, defaultValue, validator);
          });
        }
      }
      return results;
    };
  };
}
