import {
  Container,
  GabliamPlugin,
  reflection,
  Registry,
  Scan,
  toPromise,
} from '@gabliam/core';
import * as d from 'debug';
import * as fs from 'fs';
import { GraphQLResolveInfo, GraphQLSchema } from 'graphql';
import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import * as _ from 'lodash';
import { DEBUG_PATH, GRAPHQL_CONFIG, METADATA_KEY, TYPE } from './constants';
import { GraphqlConfig } from './interfaces';
import { GraphqlController, Resolver, ResolverType } from './metadatas';
import { getExtractArgs } from './utils';

const debug = d(DEBUG_PATH);

@Scan()
export abstract class GraphqlCorePlugin implements GabliamPlugin {
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

      const [controllerMetadata] = reflection
        .annotationsOfDecorator<GraphqlController>(
          controller.constructor,
          GraphqlController
        )
        .slice(-1);

      listdefinitions.push(...controllerMetadata.schema);
      listdefinitions.push(
        ...this.loadGraphqlFiles(...controllerMetadata.graphqlFiles)
      );

      const resolverMetadatas = reflection.propMetadataOfDecorator<Resolver>(
        controller.constructor,
        METADATA_KEY.resolver
      );

      if (resolverMetadatas && controllerMetadata) {
        for (const [methodName, metas] of Object.entries(resolverMetadatas)) {
          const [resolverMetadata] = metas.slice(-1);
          if (resolverMetadata.schema) {
            listdefinitions.push(resolverMetadata.schema);
          }
          if (resolverMetadata.graphqlFile) {
            listdefinitions.push(
              ...this.loadGraphqlFiles(resolverMetadata.graphqlFile)
            );
          }

          resolverList.push(
            this.getResolver(controller, methodName, resolverMetadata)
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
    methodName: string,
    resolverMetadata: Resolver
  ): IResolvers {
    let resolver: any;

    switch (resolverMetadata.type) {
      case ResolverType.Query:
      case ResolverType.Mutation:
        const extractParameters = getExtractArgs(instance, methodName);
        resolver = (
          source: any,
          args: any,
          context: any,
          info: GraphQLResolveInfo
        ) =>
          instance[methodName](
            ...extractParameters(source, args, context, info)
          );
        break;
      case ResolverType.Subscription:
      case ResolverType.Map:
      case ResolverType.ResolveType:
        resolver = toPromise(instance[methodName]());
        break;
    }

    return _.set<IResolvers>({}, resolverMetadata.path, resolver);
  }
}
