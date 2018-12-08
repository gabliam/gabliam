import { PluginConfig, Value, Bean } from '@gabliam/core';
import { log4js } from './log4js';
import { Configuration } from 'log4js';

@PluginConfig()
export class LoggerConfig {
  @Value('application.loggerConfig') loggerConfig!: Configuration | null;

  @Bean('logger')
  createLogger() {
    if (this.loggerConfig) {
      log4js.configure(this.loggerConfig);
    }

    return log4js;
  }
}
