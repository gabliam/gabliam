import * as caller from 'caller';
import * as path from 'path';
import { METADATA_KEY } from '../constants';
import { ResolverMetadata } from '../interfaces';
import { absoluteGraphqlFile } from './utils';

export interface ResolverOptions {
  schema?: string;

  path?: string;

  graphqlFile?: string;

  pwd?: string;
}

export enum ResolverType {
  ResolveType = 'ResolveType',

  Map = 'Map',

  Query = 'Query',

  Mutation = 'Mutation',

  Subscription = 'Subscription',
}

export function ResolveTypeResolver(options?: ResolverOptions) {
  return resolver(ResolverType.ResolveType, path.dirname(caller()), options);
}

export function MapResolver(options?: ResolverOptions) {
  return resolver(ResolverType.Map, path.dirname(caller()), options);
}

export function QueryResolver(options?: ResolverOptions) {
  return resolver(ResolverType.Query, path.dirname(caller()), options);
}
export function MutationResolver(options?: ResolverOptions) {
  return resolver(ResolverType.Mutation, path.dirname(caller()), options);
}
export function SubscriptionResolver(options?: ResolverOptions) {
  return resolver(ResolverType.Subscription, path.dirname(caller()), options);
}

function resolver(
  type: ResolverType,
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

    switch (type) {
      case ResolverType.Query:
      case ResolverType.Mutation:
      case ResolverType.Subscription:
        resolverPath = `${type}.${resolverPath}`;
        break;
      case ResolverType.ResolveType:
        resolverPath = `${resolverPath}.__resolveType`;
        break;
      case ResolverType.Map:
      default:
        resolverPath = resolverPath;
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
      graphqlFile: resolverOptions.graphqlFile,
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
