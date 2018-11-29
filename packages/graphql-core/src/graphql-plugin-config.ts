import { Value, Bean, PluginConfig, Joi } from '@gabliam/core';
import { DEFAULT_END_POINT_URL, GRAPHQL_CONFIG, DEBUG_PATH } from './constants';
import { GraphqlConfig } from './interfaces';
import * as d from 'debug';
import { PlaygroundConfig } from 'apollo-server-core';

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

  @Value('application.playground.config', GraphiqlOptionsValidator)
  private playground: PlaygroundConfig;

  @Value('application.graphql.graphqlFiles', Joi.array().items(Joi.string()))
  private graphqlFiles: string[] | undefined;

  @Bean(GRAPHQL_CONFIG)
  creatreConfig(): GraphqlConfig {
    const graphqlConfig: GraphqlConfig = {
      endpointUrl: this.endpointUrl,
      graphqlFiles: this.graphqlFiles,
      playground: this.playground,
    };

    debug('GraphqlConfig', graphqlConfig);

    return graphqlConfig;
  }
}
