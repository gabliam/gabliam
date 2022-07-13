import { Container, GabliamPlugin, Plugin, Scan } from '@gabliam/core';
import { express } from '@gabliam/express';
import { GraphqlConfig, GraphqlCorePlugin } from '@gabliam/graphql-core';
import { ConfigFunction, WebConfiguration } from '@gabliam/web-core';
import { ApolloServer, Config, ExpressContext } from 'apollo-server-express';
import d from 'debug';

const debug = d('Gabliam:Plugin:GraphqlPluginExpress');

@Plugin({ dependencies: [{ name: 'ExpressPlugin', order: 'before' }] })
@Scan()
export class GraphqlPlugin extends GraphqlCorePlugin implements GabliamPlugin {
  async setUpAppolloServer(
    container: Container,
    graphqlPluginConfig: GraphqlConfig,
    apolloServer: ApolloServer<ExpressContext>,
  ) {
    debug('register Middleware', graphqlPluginConfig);
    const webConfiguration =
      container.get<WebConfiguration<express.Application>>(WebConfiguration);

    await apolloServer.start();

    const instance: ConfigFunction<express.Application> = (app, _container) => {
      apolloServer.applyMiddleware({
        path: graphqlPluginConfig.endpointUrl,
        app,
      });
    };

    webConfiguration.addwebConfig({
      order: 50,
      instance,
    });
  }

  getApolloServer(config: Config<ExpressContext>) {
    return new ApolloServer(config);
  }
}
