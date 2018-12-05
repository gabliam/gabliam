import {
  Scan,
  Plugin,
  Registry,
  GabliamPlugin,
  Container,
} from '@gabliam/core';
import { MiddlewareConfig, koaRouter, KoaMiddlewareConfig } from '@gabliam/koa';
import {
  graphqlKoa,
  graphiqlKoa,
  KoaGraphQLOptionsFunction,
} from 'graphql-server-koa';
import * as bodyParser from 'koa-bodyparser';
import * as d from 'debug';
import { GraphQLOptions } from 'apollo-server-core';
import { GraphqlCorePlugin, GraphqlConfig } from '@gabliam/graphql-core';
import { GraphQLSchema } from 'graphql';

const debug = d('Gabliam:Plugin:GraphqlPluginKoa');

@Plugin({ dependencies: [{ name: 'KoaPlugin', order: 'before' }] })
@Scan()
export class GraphqlPlugin extends GraphqlCorePlugin implements GabliamPlugin {
  registerMiddleware(
    container: Container,
    registry: Registry,
    graphqlPluginConfig: GraphqlConfig,
    schema: GraphQLSchema
  ) {
    const middlewareConfig = container.get<KoaMiddlewareConfig>(
      MiddlewareConfig
    );

    middlewareConfig.addMiddleware({
      order: 50,
      instance: app => {
        debug('add graphql middleware to ExpressPlugin');
        // @ts-ignore TS2345
        app.use(bodyParser());

        const router = new koaRouter();
        router.post(
          graphqlPluginConfig.endpointUrl,
          graphqlKoa(<KoaGraphQLOptionsFunction>((req: any) => {
            let options = {};

            /* istanbul ignore if  */
            if ((<any>req).graphqlOptions) {
              options = (<any>req).graphqlOptions;
            }
            // makeExecutableSchema and ExpressGraphQLOptionsFunction use different version of GraphQLSchema typings
            // (GraphQLOptions use apollo-server-core and makeExecutableSchema use @types/graphql)
            return <GraphQLOptions>(<any>{
              schema,
              ...options,
            });
          }))
        );

        if (graphqlPluginConfig.graphiqlEnabled) {
          router.get(
            graphqlPluginConfig.endpointUrlGraphiql,
            graphiqlKoa(graphqlPluginConfig.graphiqlOptions)
          );
        }
        // @ts-ignore TS2345
        app.use(router.routes());

        // @ts-ignore TS2345
        app.use(router.allowedMethods());
      },
    });
  }
}
