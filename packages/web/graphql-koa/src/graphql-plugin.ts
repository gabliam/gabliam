import {
  Container,
  GabliamPlugin,
  Plugin,
  Registry,
  Scan,
} from '@gabliam/core';
import { GraphqlConfig, GraphqlCorePlugin } from '@gabliam/graphql-core';
import { koa } from '@gabliam/koa';
import { ConfigFunction, WebConfiguration } from '@gabliam/web-core';
import { ApolloServer } from 'apollo-server-koa';
import d from 'debug';
import { GraphQLSchema } from 'graphql';

const debug = d('Gabliam:Plugin:GraphqlPluginKoa');

@Plugin({ dependencies: [{ name: 'KoaPlugin', order: 'before' }] })
@Scan()
export class GraphqlPlugin extends GraphqlCorePlugin implements GabliamPlugin {
  getApolloServer(
    container: Container,
    registry: Registry,
    graphqlPluginConfig: GraphqlConfig,
    schema: GraphQLSchema,
  ) {
    debug('register Middleware', graphqlPluginConfig);
    const webConfiguration = container.get<WebConfiguration<koa>>(
      WebConfiguration,
    );

    const apolloServer = new ApolloServer({
      schema,
      playground: graphqlPluginConfig.playground,
    });

    const instance: ConfigFunction<koa> = (app, _container) => {
      apolloServer.applyMiddleware({
        path: graphqlPluginConfig.endpointUrl,
        // cast to any apolloserver use koa-bodyserver for koa definition ><
        app: app as any,
      });
    };

    webConfiguration.addwebConfig({
      order: 50,
      instance,
    });

    return apolloServer;
  }
}
