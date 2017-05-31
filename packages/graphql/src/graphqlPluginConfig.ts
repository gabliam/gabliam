
import { Value, Bean, PluginConfig } from '@gabliam/core';
import { DEFAULT_END_POINT_URL, DEFAULT_END_POINT_URL_GRAPHIQL, GRAPHQL_PLUGIN_CONFIG } from './constants';
import * as Joi from 'joi';
import { GraphiqlOptions } from './interfaces';

export const GraphiqlOptionsValidator = Joi.object().keys({
  subscriptionsEndpoint: Joi.string(),
  query: Joi.string(),
  variables: Joi.object(),
  operationName: Joi.number(),
  result: Joi.object(),
  passHeader: Joi.string()
});

@PluginConfig()
export class GraphqlPluginConfig {
  @Value('application.graphql.endpointUrl', Joi.string())
  endpointUrl = DEFAULT_END_POINT_URL;

  @Value('application.graphiql.endpointUrl', Joi.string())
  endpointUrlGraphiql = DEFAULT_END_POINT_URL_GRAPHIQL;

  @Value('application.graphiql.options', GraphiqlOptionsValidator)
  graphiqlOptions: GraphiqlOptions = {};


  @Bean(GRAPHQL_PLUGIN_CONFIG)
  creatreConfig() {
    return {
      endpointUrl: this.endpointUrl,
      endpointUrlGraphiql: this.endpointUrlGraphiql,
      graphiqlOptions: {
        endpointURL: this.endpointUrl,
        ...(this.graphiqlOptions)
      }
    };
  }
}





