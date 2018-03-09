import { PluginConfig, Bean, Value, Joi } from '@gabliam/core';
import { DEFAULT_ROUTING_ROOT_PATH, KOA_PLUGIN_CONFIG } from './constants';
import { KoaPluginConfig } from './interfaces';

@PluginConfig()
export class RestPluginConfig {
  @Value('application.koa.rootPath', Joi.string())
  rootPath = DEFAULT_ROUTING_ROOT_PATH;

  @Value('application.koa.port', Joi.number().positive())
  port: number = process.env.PORT ? parseInt(process.env.PORT!, 10) : 3000;

  @Value('application.koa.hostname', Joi.string())
  hostname!: string;

  @Bean(KOA_PLUGIN_CONFIG)
  restConfig(): KoaPluginConfig {
    return {
      rootPath: this.rootPath,
      port: this.port,
      hostname: this.hostname
    };
  }
}
