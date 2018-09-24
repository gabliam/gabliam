import { Bean, Joi, PluginConfig, Value } from '@gabliam/core';
import { WebPluginConfig, WEB_PLUGIN_CONFIG } from '@gabliam/web-core';
import * as bodyParser from 'body-parser';

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

export interface ExpressConfig extends WebPluginConfig {
  bodyParser: BodyParserConfig;
}

@PluginConfig()
export class ExpressPluginConfig implements WebPluginConfig {
  @Value('application.web.rootPath', Joi.string())
  rootPath = '/';

  @Value('application.web.port', Joi.number().positive())
  port: number = process.env.PORT ? parseInt(process.env.PORT!, 10) : 3000;

  @Value('application.web.hostname', Joi.string())
  hostname: string;

  @Value('application.web.bodyParser', configJoi)
  bodyParser: BodyParserConfig;

  @Bean(WEB_PLUGIN_CONFIG)
  restConfig(): ExpressConfig {
    return {
      rootPath: this.rootPath,
      port: this.port,
      hostname: this.hostname,
      bodyParser: this.bodyParser,
    };
  }
}
