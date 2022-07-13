import { Container, gabliamValue, Plugin } from '@gabliam/core';
import { ApolloServerBase } from 'apollo-server-core/dist/ApolloServer';
import { GraphqlConfig, GraphqlCorePlugin } from '../src/index';

@Plugin()
export class GraphqlPlugin extends GraphqlCorePlugin {
  setUpAppolloServer(container: Container, graphqlPluginConfig: GraphqlConfig, apolloServer: ApolloServerBase<any>): gabliamValue<void> {}

  getApolloServer() {
    return <any>null;
  }
}
