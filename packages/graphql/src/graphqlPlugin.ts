import { interfaces as coreInterfaces, inversifyInterfaces, Scan, Registry } from '@gabliam/core';
import { MiddlewareConfig } from '@gabliam/express';
import { makeExecutableSchema } from 'graphql-tools';
import { TYPE, METADATA_KEY, GRAPHQL_PLUGIN_CONFIG } from './constants';
import { ResolverMetadata, ControllerMetadata, GraphqlConfig } from './interfaces';
import { IResolvers } from 'graphql-tools/dist/Interfaces';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import * as bodyParser from 'body-parser';
import * as _ from 'lodash';
import * as fs from 'fs';

@Scan(__dirname)
export class GraphqlPlugin implements coreInterfaces.GabliamPlugin {
  bind(container: inversifyInterfaces.Container, registry: Registry) {
    registry.get(TYPE.Controller)
      .map(({ id, target }) => {
        container.bind<any>(id).to(target).inSingletonScope()
        return id;
      });
  }

  build(container: inversifyInterfaces.Container, registry: Registry) {
    const middlewareConfig = container.get<MiddlewareConfig>(MiddlewareConfig);
    const graphqlPluginConfig = container.get<GraphqlConfig>(GRAPHQL_PLUGIN_CONFIG);
    const typeDefs: string[] = [];

    if (graphqlPluginConfig.graphqlFiles) {
      typeDefs.push(...this.loadGraphqlFiles(...graphqlPluginConfig.graphqlFiles));
    }

    const controllerIds = registry.get(TYPE.Controller);
    const resolverList: IResolvers[] = [];

    for (const { id: controllerId } of controllerIds) {
      const controller = container.get<object>(controllerId);

      const controllerMetadata: ControllerMetadata = Reflect.getOwnMetadata(
        METADATA_KEY.controller,
        controller.constructor
      );

      typeDefs.push(...controllerMetadata.schema);
      typeDefs.push(...this.loadGraphqlFiles(...controllerMetadata.graphqlFiles));

      const resolverMetadatas: ResolverMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.resolver,
        controller.constructor
      );

      if (resolverMetadatas && controllerMetadata) {
        for (const resolverMetadata of resolverMetadatas) {
          if (resolverMetadata.schema) {
            typeDefs.push(resolverMetadata.schema);
          }
          if (resolverMetadata.graphqlFile) {
            typeDefs.push(...this.loadGraphqlFiles(resolverMetadata.graphqlFile));
          }

          resolverList.push(this.getResolver(
            container,
            controllerId,
            resolverMetadata
          ));
        }
      }
    }

    const resolvers = _.merge<IResolvers>({}, ...resolverList);


    const executableSchema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    middlewareConfig.addMiddleware({
      order: 50,
      instance: (app) => {
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        app.use(graphqlPluginConfig.endpointUrl, graphqlExpress(req => {
          let options = {};

          if ((<any> req).graphqlOptions) {
            options = (<any> req).graphqlOptions;
          }

          return {
            schema: executableSchema,
            ...options
          }
        }));

        app.use(graphqlPluginConfig.endpointUrlGraphiql, graphiqlExpress(graphqlPluginConfig.graphiqlOptions));
      }
    });
  }

  private loadGraphqlFiles(...files: string[]) {
    return files.map(file => fs.readFileSync(file, 'UTF-8'));
  }

  private getResolver(
    container: inversifyInterfaces.Container,
    controllerId: any,
    resolverMetadata: ResolverMetadata,
  ): IResolvers {
    const instance = container.get<any>(controllerId);
    const result: any = instance[resolverMetadata.key]();

    if (_.isFunction(result)) { // IResolverObject
      return _.set<IResolvers>({}, resolverMetadata.path, result.bind(instance));
    } else { // GraphQLScalarType
      return _.set<IResolvers>({}, resolverMetadata.path, result);
    }

  }
}
