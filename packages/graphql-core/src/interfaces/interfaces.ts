import { inversifyInterfaces } from '@gabliam/core';
import * as GraphiQL from 'graphql-server-module-graphiql';
import { GraphQLFieldResolver } from 'graphql';

export type listControllers = inversifyInterfaces.ServiceIdentifier<any>[];

export interface GraphiqlOptions {
  endpointURL?: string;

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

  graphqlFiles: string[] | undefined;

  graphiqlEnabled: boolean;
}

export interface GraphQLMapFieldResolver<TSource = any, TContext = any> {
  [FieldName: string]: GraphQLFieldResolver<TSource, TContext>;
}
