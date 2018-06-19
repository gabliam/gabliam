import { Config, Value, Bean, Init } from '@gabliam/core';
import { LokiDatabase } from './loki-database';

@Config()
export class LokiConfiguration {
  @Value('application.loki') dbPath: string;

  private loki: LokiDatabase;

  @Bean(LokiDatabase)
  async createLoki() {
    this.loki = new LokiDatabase(this.dbPath);
    return this.loki;
  }

  @Init()
  async startLoki() {
    await this.loki.start();
  }
}
