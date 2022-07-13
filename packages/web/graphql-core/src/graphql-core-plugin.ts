import { Container, GabliamPlugin, gabliamValue, Registry, Scan, toPromise } from '@gabliam/core';
import { ApolloServerBase, ApolloServerPluginLandingPageDisabled, ApolloServerPluginLandingPageGraphQLPlayground, Config } from 'apollo-server-core';
import { buildSchema } from 'type-graphql';
import { APPOLLO_SERVER_BASE, GRAPHQL_CONFIG, TYPE } from './constants';
import { GraphqlConfig } from './interfaces';

@Scan()
export abstract class GraphqlCorePlugin<ContextFunctionParams = any>
  implements GabliamPlugin {
  async build(container: Container, registry: Registry) {
    const graphqlPluginConfig = container.get<GraphqlConfig>(GRAPHQL_CONFIG);
    const controllerIds = registry
      .get(TYPE.Controller)
      .map((val) => val.target);

    const schema = await buildSchema({
      resolvers: controllerIds as [Function, ...Function[]],
      container: {
        get(someClass) {
          return container.get(someClass);
        },
      },
    });

    const apolloServer = await toPromise(this.getApolloServer({
      schema,
      plugins: [
        graphqlPluginConfig.playgroundEnabled ?
        ApolloServerPluginLandingPageGraphQLPlayground(graphqlPluginConfig.playground) : ApolloServerPluginLandingPageDisabled()
      ],
    }));

    container.bind(APPOLLO_SERVER_BASE).toConstantValue(apolloServer);

    await toPromise(this.setUpAppolloServer(container, graphqlPluginConfig, apolloServer));
  }

  abstract getApolloServer(
    config: Config<ContextFunctionParams>,
  ): gabliamValue<ApolloServerBase<ContextFunctionParams>>;

  abstract setUpAppolloServer(
    container: Container,
    graphqlPluginConfig: GraphqlConfig,
    apolloServer: ApolloServerBase<ContextFunctionParams>,
  ): gabliamValue<void>;

  // abstract getApolloServer(
  //   container: Container,
  //   registry: Registry,
  //   graphqlPluginConfig: GraphqlConfig,
  //   schema: GraphQLSchema
  // ): ApolloServerBase;
}
