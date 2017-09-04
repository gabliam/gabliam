import {
  PluginConfig,
  Value,
  Bean,
  CORE_CONFIG,
  inject,
  interfaces
} from '@gabliam/core';
import { log4js } from './log4js';
import * as Joi from 'joi';
import * as path from 'path';
import * as fs from 'fs';

@PluginConfig()
export class LoggerConfig {
  @Value('application.loggerConfigPath', Joi.string())
  loggerConfigPath: string | null;

  private configPath: string;

  constructor(@inject(CORE_CONFIG) coreConfig: interfaces.GabliamConfig) {
    this.configPath = coreConfig.configPath;
  }

  @Bean('logger')
  createLogger() {
    if (this.loggerConfigPath && fs.existsSync(this.loggerConfigPath)) {
      log4js.configure(this.loggerConfigPath);
    } else {
      const defaultFilePath = path.resolve(this.configPath, 'log4js.json');
      if (fs.existsSync(defaultFilePath)) {
        log4js.configure(defaultFilePath);
      }
    }
    return log4js;
  }
}
