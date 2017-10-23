import { Config, Value, Bean } from '@gabliam/core';
import { LokiDatabase } from './loki-database';

@Config()
export class LokiConfiguration {
  @Value('application.loki') dbPath: string;

  @Bean(LokiDatabase)
  async createLoki() {
    const loki = new LokiDatabase(this.dbPath);
    await loki.waitLoad();
    return loki;
  }
}
