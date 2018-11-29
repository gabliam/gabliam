import {
  Container,
  GabliamPlugin,
  Plugin,
  Registry,
  Scan,
} from '@gabliam/core';
import { express } from '@gabliam/express';
import { GraphqlConfig, GraphqlCorePlugin } from '@gabliam/graphql-core';
import { ConfigFunction, WebConfiguration } from '@gabliam/web-core';
import { ApolloServer } from 'apollo-server-express';
import * as d from 'debug';
import { GraphQLSchema } from 'graphql';

const debug = d('Gabliam:Plugin:GraphqlPluginExpress');

@Plugin({ dependencies: [{ name: 'ExpressPlugin', order: 'before' }] })
@Scan()
export class GraphqlPlugin extends GraphqlCorePlugin implements GabliamPlugin {
  registerMiddleware(
    container: Container,
    registry: Registry,
    graphqlPluginConfig: GraphqlConfig,
    schema: GraphQLSchema
  ) {
    debug('register Middleware', graphqlPluginConfig);
    const webConfiguration = container.get<
      WebConfiguration<express.Application>
    >(WebConfiguration);

    const instance: ConfigFunction<express.Application> = (app, _container) => {
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
