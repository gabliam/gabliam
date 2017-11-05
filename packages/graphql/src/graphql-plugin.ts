import {
  Scan,
  Plugin,
  Registry,
  GabliamPlugin,
  Container
} from '@gabliam/core';
import { MiddlewareConfig } from '@gabliam/express';
import {
  TYPE,
  DEBUG_PATH
} from './constants';
import {
  graphqlExpress,
  graphiqlExpress,
  ExpressGraphQLOptionsFunction
} from 'graphql-server-express';
import * as bodyParser from 'body-parser';
import * as d from 'debug';
import { GraphQLOptions } from 'apollo-server-core';
import { GraphqlCorePlugin, GraphqlConfig } from '@gabliam/graphql-core';
import { GraphQLSchema } from 'graphql';

const debug = d(DEBUG_PATH);

@Plugin({ dependencies: [{ name: 'ExpressPlugin', order: 'before' }] })
@Scan()
export class GraphqlPlugin extends GraphqlCorePlugin implements GabliamPlugin {
  bind(container: Container, registry: Registry) {
    registry.get(TYPE.Controller).map(({ id, target }) => {
      container
        .bind<any>(id)
        .to(target)
        .inSingletonScope();
      return id;
    });
  }

  registerMiddleware(
    container: Container,
    registry: Registry,
    graphqlPluginConfig: GraphqlConfig,
    schema: GraphQLSchema
  ) {
    const middlewareConfig = container.get<MiddlewareConfig>(MiddlewareConfig);

    middlewareConfig.addMiddleware({
      order: 50,
      instance: app => {
        debug('add graphql middleware to ExpressPlugin');
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        app.use(
          graphqlPluginConfig.endpointUrl,
          graphqlExpress(<ExpressGraphQLOptionsFunction>((req: any) => {
            let options = {};

            /* istanbul ignore if  */
            if ((<any>req).graphqlOptions) {
              options = (<any>req).graphqlOptions;
            }
            // makeExecutableSchema and ExpressGraphQLOptionsFunction use different version of GraphQLSchema typings
            // (GraphQLOptions use apollo-server-core and makeExecutableSchema use @types/graphql)
            return <GraphQLOptions>(<any>{
              schema,
              ...options
            });
          }))
        );

        if (graphqlPluginConfig.graphiqlEnabled) {
          app.use(
            graphqlPluginConfig.endpointUrlGraphiql,
            graphiqlExpress(graphqlPluginConfig.graphiqlOptions)
          );
        }
      }
    });
  }
}
