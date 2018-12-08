import {
  Container,
  GabliamPlugin,
  Registry,
  Scan,
  toPromise,
} from '@gabliam/core';
import * as d from 'debug';
import * as fs from 'fs';
import { GraphQLSchema, GraphQLResolveInfo } from 'graphql';
import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import * as _ from 'lodash';
import { DEBUG_PATH, GRAPHQL_CONFIG, METADATA_KEY, TYPE } from './constants';
import {
  ResolverType,
  ParameterMetadata,
  ControllerParameterMetadata,
} from './decorator';
import {
  ControllerMetadata,
  GraphqlConfig,
  ResolverMetadata,
} from './interfaces';
import { extractParameters } from './utils';

const debug = d(DEBUG_PATH);

@Scan(__dirname)
export abstract class GraphqlCorePlugin implements GabliamPlugin {
  bind(container: Container, registry: Registry) {
    registry.get(TYPE.Controller).map(({ id, target }) => {
      container
        .bind(id)
        .to(target)
        .inSingletonScope();
      return id;
    });
  }

  build(container: Container, registry: Registry) {
    const graphqlPluginConfig = container.get<GraphqlConfig>(GRAPHQL_CONFIG);
    const listdefinitions: string[] = [];

    if (graphqlPluginConfig.graphqlFiles) {
      listdefinitions.push(
        ...this.loadGraphqlFiles(...graphqlPluginConfig.graphqlFiles)
      );
    }

    const controllerIds = registry.get(TYPE.Controller);
    const resolverList: IResolvers[] = [];

    for (const { id: controllerId } of controllerIds) {
      const controller = container.get<object>(controllerId);
      const paramList: ControllerParameterMetadata =
        Reflect.getOwnMetadata(
          METADATA_KEY.controllerParameter,
          controller.constructor
        ) || new Map();

      const controllerMetadata: ControllerMetadata = Reflect.getOwnMetadata(
        METADATA_KEY.controller,
        controller.constructor
      );

      listdefinitions.push(...controllerMetadata.schema);
      listdefinitions.push(
        ...this.loadGraphqlFiles(...controllerMetadata.graphqlFiles)
      );

      const resolverMetadatas: ResolverMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.resolver,
        controller.constructor
      );

      if (resolverMetadatas && controllerMetadata) {
        for (const resolverMetadata of resolverMetadatas) {
          if (resolverMetadata.schema) {
            listdefinitions.push(resolverMetadata.schema);
          }
          if (resolverMetadata.graphqlFile) {
            listdefinitions.push(
              ...this.loadGraphqlFiles(resolverMetadata.graphqlFile)
            );
          }
          const params = paramList.get(resolverMetadata.key) || [];
          resolverList.push(
            this.getResolver(controller, resolverMetadata, params)
          );
        }
      }
    }

    const queries = [];
    const mutations = [];
    const others = [];

    for (const definitions of listdefinitions) {
      const types = definitions
        .split('}')
        .map(s => s.replace(/^\s+|\s+$/g, '')) // remove space
        .filter(s => s !== '}' && s !== '') // remove usless
        .filter(s => s[0] !== '#') // remove commentaries lines
        .map(s => s + '\n}');

      for (let type of types) {
        if (/\s*type\s*Query\s*{\s*/g.test(type)) {
          if (type.slice(0, 6) !== 'extend') {
            // add extend
            type = `extend ${type}`;
          }
          queries.push(type);
        } else if (/\s*type\s*Mutation\s*{\s*/g.test(type)) {
          if (type.slice(0, 6) !== 'extend') {
            type = `extend ${type}`;
          }
          mutations.push(type);
        } else {
          others.push(type);
        }
      }
    }

    const typeDefs: string[] = [];
    // for first Type Query remove extend
    if (queries.length) {
      queries[0] = queries[0].slice(7);
      typeDefs.push(...queries);
    }

    if (mutations.length) {
      mutations[0] = mutations[0].slice(7);
      typeDefs.push(...mutations);
    }

    typeDefs.push(...others);

    const resolvers = <IResolvers>_.merge({}, ...resolverList);

    if (Object.keys(resolvers).length === 0) {
      return;
    }

    debug('typeDefs', typeDefs);
    const schema = <GraphQLSchema>(<any>makeExecutableSchema({
      typeDefs,
      resolvers,
    }));

    this.registerMiddleware(container, registry, graphqlPluginConfig, schema);
  }

  abstract registerMiddleware(
    container: Container,
    registry: Registry,
    graphqlPluginConfig: GraphqlConfig,
    schema: GraphQLSchema
  ): void;

  private loadGraphqlFiles(...files: string[]) {
    return files.map(file => fs.readFileSync(file, 'UTF-8'));
  }

  private getResolver(
    instance: any,
    resolverMetadata: ResolverMetadata,
    params: ParameterMetadata[]
  ): IResolvers {
    let resolver: any;

    switch (resolverMetadata.type) {
      case ResolverType.Query:
      case ResolverType.Mutation:
      case ResolverType.Subscription:
        resolver = (
          source: any,
          args: any,
          context: any,
          info: GraphQLResolveInfo
        ) =>
          instance[resolverMetadata.key](
            ...extractParameters(source, args, context, info, params)
          );
        break;
      case ResolverType.Map:
      case ResolverType.ResolveType:
        resolver = toPromise(instance[resolverMetadata.key]());
        break;
    }

    return _.set<IResolvers>({}, resolverMetadata.path, resolver);
  }
}
