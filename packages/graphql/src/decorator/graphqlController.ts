import { TYPE, METADATA_KEY } from '../constants';
import { injectable, register, inversifyInterfaces as interfaces } from '@gabliam/core';
import { ResolverMetadata, resolverType, ControllerMetadata } from '../interfaces';


/**
 * GraphqlController decorator
 *
 * Add a GraphqlController
 * @param  {string} name? name of the GraphqlController
 */
export function GraphqlController(schema: string[]) {
  return (target: any) => {
    const id: interfaces.ServiceIdentifier<any> = target;
    injectable()(target);
    register(TYPE.Controller, { id, target })(target);
    const metadata: ControllerMetadata = { schema };
    Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);
  }
}


export function QueryResolver(schema: string, path?: string) {
  return resolver('Query', schema);
}
export function MutationResolver(schema: string, path?: string) {
  return resolver('Mutation', schema);
}
export function SubscriptionResolver(schema: string, path?: string) {
  return resolver('Subscription', schema);
}

export function Resolver(path: string) {
  return resolver(null, null, path);
}

function resolver(type: resolverType | null, schema: string | null, path?: string) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    let resolverPath = '';
    if (path) {
      resolverPath = path
    } else {
      resolverPath = key;
    }

    if (type) {
      resolverPath = `${type}.${resolverPath}`;
    }

    const metadata: ResolverMetadata = { type, path: resolverPath, key, schema };
    let metadataList: ResolverMetadata[] = [];

    if (!Reflect.hasOwnMetadata(METADATA_KEY.resolver, target.constructor)) {
      Reflect.defineMetadata(METADATA_KEY.resolver, metadataList, target.constructor);
    } else {
      metadataList = Reflect.getOwnMetadata(METADATA_KEY.resolver, target.constructor);
    }

    metadataList.push(metadata);
  };
}
