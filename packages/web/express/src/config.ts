import { Bean, Joi, PluginConfig, Value } from '@gabliam/core';
import * as bodyParser from 'body-parser';
import { EXPRESS_PLUGIN_CONFIG } from './constants';

const options = Joi.object().keys({
  inflate: Joi.boolean(),
  limit: [Joi.number(), Joi.string()],
  type: [Joi.string(), Joi.array().items(Joi.string())],
});

const optionsJson = options.keys({
  strict: Joi.boolean(),
});

const optionsText = options.keys({
  defaultCharset: Joi.string(),
});

const optionsUrlencoded = options
  .keys({
    extended: Joi.boolean(),
    parameterLimit: Joi.number(),
  })
  .default({ extended: false });

const configJoi = Joi.object()
  .keys({
    json: Joi.boolean().default(true),
    optionsJson,
    urlencoded: Joi.boolean().default(true),
    optionsUrlencoded,
    text: Joi.boolean().default(false),
    optionsText,
  })
  .default({
    json: true,
    urlencoded: true,
    optionsUrlencoded: { extended: false },
    text: false,
  });

export interface BodyParserConfig {
  json: boolean;
  optionsJson?: bodyParser.OptionsJson;
  urlencoded: boolean;
  optionsUrlencoded?: bodyParser.OptionsUrlencoded;
  text: boolean;
  optionsText?: bodyParser.OptionsText;
}

export interface ExpressConfig {
  bodyParser: BodyParserConfig;
}

@PluginConfig()
export class ExpressPluginConfig implements ExpressConfig {
  @Value('application.web.bodyParser', configJoi)
  bodyParser: BodyParserConfig;

  @Bean(EXPRESS_PLUGIN_CONFIG)
  restConfig(): ExpressConfig {
    return {
      bodyParser: this.bodyParser,
    };
  }
}
