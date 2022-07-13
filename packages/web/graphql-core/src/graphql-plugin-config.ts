import { Bean, Joi, PluginConfig, Value } from '@gabliam/core';
import { ApolloServerPluginLandingPageGraphQLPlaygroundOptions } from 'apollo-server-core';
import d from 'debug';
import { DEBUG_PATH, DEFAULT_END_POINT_URL, GRAPHQL_CONFIG } from './constants';
import { GraphqlConfig } from './interfaces';

const debug = d(`${DEBUG_PATH}:GraphqlPluginConfig`);

export const GraphiqlOptionsValidator = Joi.object().keys({
  endpointURL: Joi.string(),
  subscriptionsEndpoint: Joi.string(),
  query: Joi.string(),
  variables: Joi.object(),
  operationName: Joi.number(),
  result: Joi.object(),
  passHeader: Joi.string(),
});

@PluginConfig()
export class GraphqlPluginConfig {
  @Value('application.graphql.endpointUrl', Joi.string())
  private endpointUrl: string = DEFAULT_END_POINT_URL;

  @Value('application.graphql.playground.enabled', Joi.boolean())
  private playgroundEnabled = false;

  @Value('application.graphql.playground.config', GraphiqlOptionsValidator)
  private playground: ApolloServerPluginLandingPageGraphQLPlaygroundOptions;

  @Bean(GRAPHQL_CONFIG)
  creatreConfig(): GraphqlConfig {
    const graphqlConfig: GraphqlConfig = {
      endpointUrl: this.endpointUrl,
      playground: this.playground,
      playgroundEnabled: this.playgroundEnabled,
    };
    debug('GraphqlConfig', graphqlConfig);

    return graphqlConfig;
  }
}
