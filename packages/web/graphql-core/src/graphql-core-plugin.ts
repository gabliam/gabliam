import { Container, GabliamPlugin, Registry, Scan } from '@gabliam/core';
import { WebConfiguration } from '@gabliam/web-core';
import { ApolloServerBase } from 'apollo-server-core';
import { GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
import { GRAPHQL_CONFIG, TYPE } from './constants';
import { GraphqlConfig } from './interfaces';

@Scan()
export abstract class GraphqlCorePlugin implements GabliamPlugin {
  async build(container: Container, registry: Registry) {
    const graphqlPluginConfig = container.get<GraphqlConfig>(GRAPHQL_CONFIG);
    const controllerIds = registry.get(TYPE.Controller).map(val => val.target);
    const schema = await buildSchema({
      resolvers: controllerIds as [Function, ...Function[]],
      container: {
        get(someClass) {
          return container.get(someClass);
        },
      },
    });

    const apolloServer = this.getApolloServer(
      container,
      registry,
      graphqlPluginConfig,
      schema
    );

    container.get(WebConfiguration).addServerConfigs(server => {
      apolloServer.installSubscriptionHandlers(server);
      return server;
    });
  }

  abstract getApolloServer(
    container: Container,
    registry: Registry,
    graphqlPluginConfig: GraphqlConfig,
    schema: GraphQLSchema
  ): ApolloServerBase;
}
