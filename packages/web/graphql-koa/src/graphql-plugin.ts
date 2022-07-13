import { Container, GabliamPlugin, Plugin, Scan } from '@gabliam/core';
import { GraphqlConfig, GraphqlCorePlugin } from '@gabliam/graphql-core';
import { koa } from '@gabliam/koa';
import { ConfigFunction, WebConfiguration } from '@gabliam/web-core';
import { ApolloServer, Config } from 'apollo-server-koa';
import d from 'debug';

const debug = d('Gabliam:Plugin:GraphqlPluginKoa');

@Plugin({ dependencies: [{ name: 'KoaPlugin', order: 'before' }] })
@Scan()
export class GraphqlPlugin extends GraphqlCorePlugin implements GabliamPlugin {
  async setUpAppolloServer(
    container: Container,
    graphqlPluginConfig: GraphqlConfig,
    apolloServer: ApolloServer,
  ) {
    debug('register Middleware', graphqlPluginConfig);
    const webConfiguration =
      container.get<WebConfiguration<koa>>(WebConfiguration);

    await apolloServer.start();

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
  }

  getApolloServer(config: Config) {
    return new ApolloServer(config) as any;
  }
}
