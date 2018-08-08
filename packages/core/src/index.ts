import 'reflect-metadata';
export * from './interfaces';
export * from './decorators';
export * from './gabliam';
export {
  APP_CONFIG,
  CORE_CONFIG,
  VALUE_EXTRACTOR,
  INJECT_CONTAINER_KEY,
} from './constants';

export * from './registry';
export * from './errors';
export * from './utils';
export * from './joi';
export * from './container';
export { FileLoader, Resolver, configResolver } from './loaders';

export {
  injectable,
  tagged,
  named,
  inject,
  optional,
  unmanaged,
  multiInject,
  targetName,
  decorate,
  postConstruct,
  interfaces as inversifyInterfaces,
} from 'inversify';
