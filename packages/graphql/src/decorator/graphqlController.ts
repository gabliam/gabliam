import { TYPE, METADATA_KEY } from '../constants';
import { injectable, register, inversifyInterfaces as interfaces } from '@gabliam/core';
import { ResolverMetadata, resolverType, ControllerMetadata } from '../interfaces';



/**
 * GraphqlController decorator
 *
 * Add a GraphqlController
 */
export function GraphqlController({
  schema = [],
  graphqlFiles = []
}: {
    schema?: string[]
    graphqlFiles?: string[]
  } = {
    schema: [],
    graphqlFiles: []
  }) {
  return (target: any) => {
    const id: interfaces.ServiceIdentifier<any> = target;
    injectable()(target);
    register(TYPE.Controller, { id, target })(target);
    const metadata: ControllerMetadata = { schema, graphqlFiles };
    Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);
  }
}

export interface ResolverOptions {
  schema?: string;

  path?: string;

  graphqlFile?: string;
}


export function QueryResolver(options?: ResolverOptions) {
  return resolver('Query', options);
}
export function MutationResolver(options?: ResolverOptions) {
  return resolver('Mutation', options);
}
export function SubscriptionResolver(options?: ResolverOptions) {
  return resolver('Subscription', options);
}

export function Resolver(options?: ResolverOptions) {
  return resolver(null, options);
}

function resolver(type: resolverType | null, resolverOptions: ResolverOptions = {}) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    let resolverPath = '';
    if (resolverOptions.path) {
      resolverPath = resolverOptions.path
    } else {
      resolverPath = key;
    }

    if (type) {
      resolverPath = `${type}.${resolverPath}`;
    }

    const metadata: ResolverMetadata = {
      type,
      path: resolverPath,
      key,
      schema: resolverOptions.schema,
      graphqlFile: resolverOptions.graphqlFile
    };

    let metadataList: ResolverMetadata[] = [];

    if (!Reflect.hasOwnMetadata(METADATA_KEY.resolver, target.constructor)) {
      Reflect.defineMetadata(METADATA_KEY.resolver, metadataList, target.constructor);
    } else {
      metadataList = Reflect.getOwnMetadata(METADATA_KEY.resolver, target.constructor);
    }

    metadataList.push(metadata);
  };
}
