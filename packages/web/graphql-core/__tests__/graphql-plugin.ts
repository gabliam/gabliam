import { Plugin, Container, Registry } from '@gabliam/core';
import { GraphqlCorePlugin, GraphqlConfig, GraphQLSchema } from '../src/index';

@Plugin()
export class GraphqlPlugin extends GraphqlCorePlugin {
  getApolloServer() {
    return <any>null;
  }

  registerMiddleware(
    container: Container,
    registry: Registry,
    graphqlPluginConfig: GraphqlConfig,
    schema: GraphQLSchema,
  ): void {}
}
