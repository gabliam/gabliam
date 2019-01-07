import { PlaygroundConfig } from 'apollo-server-core';
import { GraphQLResolveInfo } from 'graphql';

export type extractArgsFn = (
  source: any,
  args: any,
  context: any,
  info: GraphQLResolveInfo
) => any;

export interface GraphqlConfig {
  endpointUrl: string;
  playground: PlaygroundConfig;

  graphqlFiles: string[] | undefined;
}
