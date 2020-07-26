import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import _ from 'lodash';
import { Container } from './container';
import { makeActivationInject } from './inject-container-activation';
import { ContainerActivationHook } from './interfaces';
import { makeActivationValue } from './value-activation';

/**
 * Create the inversify container
 */
export function createContainer(
  ...activationHooks: ContainerActivationHook[]
): Container {
  const container = new Container();
  activationHooks.unshift(
    makeActivationInject(container),
    makeActivationValue(container)
  );

  // add custom onActivation hooks
  container.bind = <any>_.wrap(
    container.bind,
    (originalBind, ...rest: any[]) => {
      const binding = originalBind.apply(container, rest);
      binding._binding.onActivation = (context: any, instance: any) => {
        const wires = _.flow(activationHooks);
        return wires(instance);
      };
      return binding;
    }
  );

  const middlewares = [];

  /* istanbul ignore if */
  if (process.env.NODE_ENV === 'development') {
    const logger = makeLoggerMiddleware();
    middlewares.push(logger);
  }

  container.applyMiddleware(...middlewares);
  return container;
}
