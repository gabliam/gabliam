import {
  Container,
  GabliamPlugin,
  Plugin,
  Registry,
  Scan,
} from '@gabliam/core';
import { GraphqlConfig, GraphqlCorePlugin } from '@gabliam/graphql-core';
import { koa } from '@gabliam/koa';
import * as d from 'debug';
import { GraphQLSchema } from 'graphql';
import { WebConfiguration, ConfigFunction } from '@gabliam/web-core/src';
import { ApolloServer } from 'apollo-server-koa';

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
    debug('register Middleware', graphqlPluginConfig);
    const webConfiguration = container.get<WebConfiguration<koa>>(
      WebConfiguration
    );

    const instance: ConfigFunction<koa> = (app, _container) => {
      const server = new ApolloServer({
        schema,
        playground: graphqlPluginConfig.playground,
      });
      server.applyMiddleware({
        path: graphqlPluginConfig.endpointUrl,
        app,
      });
    };

    webConfiguration.addwebConfig({
      order: 50,
      instance,
    });
  }
}
