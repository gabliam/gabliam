import { interfaces } from 'inversify';
import { METADATA_KEY, INJECT_CONTAINER_KEY } from '../constants';
import { Container } from './container';

/**
 *  Make  the value middleware
 *  Intercept all creation, if the class as a InjectContainerMetadata then inject the container
 * @param  {Container} container
 */
export function makeInjectMiddleware(container: Container) {
  return function InjectMiddleware(next: interfaces.Next): interfaces.Next {
    return (args: interfaces.NextArgs) => {
      let results: any = null;
      results = next(args);

      if (results && results.constructor) {
        const injectContainer = Reflect.hasMetadata(
          METADATA_KEY.injectContainer,
          results.constructor
        );

        if (injectContainer) {
          Object.defineProperty(results, INJECT_CONTAINER_KEY, {
            value: container
          });
        }
      }
      return results;
    };
  };
}
