import { inversifyInterfaces } from '@gabliam/core';
import * as GraphiQL from 'graphql-server-module-graphiql';


export type listControllers = inversifyInterfaces.ServiceIdentifier<any>[];


export interface SchemaByType {
  Query: string[];

  Mutation: string[];

  Subscription: string[];
}

export type resolverType = keyof SchemaByType;

export interface GraphiqlOptions {
  subscriptionsEndpoint?: string;
  query?: string;
  variables?: Object;
  operationName?: string;
  result?: Object;
  passHeader?: string;
}

export interface GraphqlConfig {
  endpointUrl: string;

  endpointUrlGraphiql: string;

  graphiqlOptions: GraphiQL.GraphiQLData;
}
