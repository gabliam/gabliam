import { PlaygroundConfig } from 'apollo-server-core';

export interface GraphqlConfig {
  endpointUrl: string;
  playground: PlaygroundConfig;

  graphqlFiles: string[] | undefined;
}
