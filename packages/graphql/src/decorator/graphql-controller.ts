import { TYPE, METADATA_KEY } from '../constants';
import {
  injectable,
  register,
  inversifyInterfaces as interfaces
} from '@gabliam/core';
import {
  ResolverMetadata,
  resolverType,
  ControllerMetadata
} from '../interfaces';
import * as path from 'path';
import * as caller from 'caller';

/**
 * GraphqlController decorator
 *
 * Add a GraphqlController
 */
export function GraphqlController(
  {
    schema = [],
    graphqlFiles = [],
    pwd
  }: {
    schema?: string[];
    graphqlFiles?: string[];
    pwd?: string;
  } = {
    schema: [],
    graphqlFiles: []
  }
) {
  if (!pwd) {
    pwd = path.dirname(caller());
  }
  if (graphqlFiles) {
    graphqlFiles = absoluteGraphqlFiles(graphqlFiles, pwd);
  }
  return (target: any) => {
    const id: interfaces.ServiceIdentifier<any> = target;
    injectable()(target);
    register(TYPE.Controller, { id, target })(target);
    const metadata: ControllerMetadata = { schema, graphqlFiles };
    Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);
  };
}

export interface ResolverOptions {
  schema?: string;

  path?: string;

  graphqlFile?: string;

  pwd?: string;
}

function absoluteGraphqlFiles(graphqlFiles: string[], pwd: string) {
  return graphqlFiles.map(f => absoluteGraphqlFile(f, pwd));
}

function absoluteGraphqlFile(graphqlFile: string, pwd: string) {
  if (path.isAbsolute(graphqlFile)) {
    return graphqlFile;
  } else {
    return path.resolve(pwd, graphqlFile);
  }
}

export function QueryResolver(options?: ResolverOptions) {
  return resolver('Query', path.dirname(caller()), options);
}
export function MutationResolver(options?: ResolverOptions) {
  return resolver('Mutation', path.dirname(caller()), options);
}
export function SubscriptionResolver(options?: ResolverOptions) {
  return resolver('Subscription', path.dirname(caller()), options);
}

export function Resolver(options?: ResolverOptions) {
  return resolver(null, path.dirname(caller()), options);
}

function resolver(
  type: resolverType | null,
  defaultPwd: string,
  resolverOptions: ResolverOptions = {}
) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    let resolverPath = '';
    if (resolverOptions.path) {
      resolverPath = resolverOptions.path;
    } else {
      resolverPath = key;
    }

    if (type) {
      resolverPath = `${type}.${resolverPath}`;
    }

    if (resolverOptions.graphqlFile) {
      const pwd = resolverOptions.pwd || defaultPwd;
      resolverOptions.graphqlFile = absoluteGraphqlFile(
        resolverOptions.graphqlFile,
        pwd
      );
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
      Reflect.defineMetadata(
        METADATA_KEY.resolver,
        metadataList,
        target.constructor
      );
    } else {
      metadataList = Reflect.getOwnMetadata(
        METADATA_KEY.resolver,
        target.constructor
      );
    }

    metadataList.push(metadata);
  };
}
