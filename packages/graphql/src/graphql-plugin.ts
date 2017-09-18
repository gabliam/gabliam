import {
  interfaces as coreInterfaces,
  inversifyInterfaces,
  Scan,
  Registry
} from '@gabliam/core';
import { MiddlewareConfig } from '@gabliam/express';
import { makeExecutableSchema } from 'graphql-tools';
import {
  TYPE,
  METADATA_KEY,
  GRAPHQL_PLUGIN_CONFIG,
  DEBUG_PATH
} from './constants';
import {
  ResolverMetadata,
  ControllerMetadata,
  GraphqlConfig
} from './interfaces';
import { IResolvers } from 'graphql-tools/dist/Interfaces';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import * as bodyParser from 'body-parser';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as d from 'debug';

const debug = d(DEBUG_PATH);

@Scan(__dirname)
export class GraphqlPlugin implements coreInterfaces.GabliamPlugin {
  bind(container: inversifyInterfaces.Container, registry: Registry) {
    registry.get(TYPE.Controller).map(({ id, target }) => {
      container
        .bind<any>(id)
        .to(target)
        .inSingletonScope();
      return id;
    });
  }

  build(container: inversifyInterfaces.Container, registry: Registry) {
    const middlewareConfig = container.get<MiddlewareConfig>(MiddlewareConfig);
    const graphqlPluginConfig = container.get<GraphqlConfig>(
      GRAPHQL_PLUGIN_CONFIG
    );
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

          resolverList.push(
            this.getResolver(container, controllerId, resolverMetadata)
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

    const resolvers = _.merge<IResolvers>({}, ...resolverList);

    if (Object.keys(resolvers).length === 0) {
      return;
    }

    debug('typeDefs', typeDefs);
    const executableSchema = makeExecutableSchema({
      typeDefs,
      resolvers
    });
    middlewareConfig.addMiddleware({
      order: 50,
      instance: app => {
        debug('add graphql middleware to ExpressPlugin');
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        app.use(
          graphqlPluginConfig.endpointUrl,
          graphqlExpress(req => {
            let options = {};

            /* istanbul ignore if  */
            if ((<any>req).graphqlOptions) {
              options = (<any>req).graphqlOptions;
            }

            return {
              schema: executableSchema,
              ...options
            };
          })
        );

        app.use(
          graphqlPluginConfig.endpointUrlGraphiql,
          graphiqlExpress(graphqlPluginConfig.graphiqlOptions)
        );
      }
    });
  }

  private loadGraphqlFiles(...files: string[]) {
    return files.map(file => fs.readFileSync(file, 'UTF-8'));
  }

  private getResolver(
    container: inversifyInterfaces.Container,
    controllerId: any,
    resolverMetadata: ResolverMetadata
  ): IResolvers {
    const instance = container.get<any>(controllerId);
    const result: any = instance[resolverMetadata.key]();

    if (_.isFunction(result)) {
      // IResolverObject
      return _.set<IResolvers>(
        {},
        resolverMetadata.path,
        result.bind(instance)
      );
    } else {
      // GraphQLScalarType
      return _.set<IResolvers>({}, resolverMetadata.path, result);
    }
  }
}
