import { Config, Value, Bean } from '../../../src';
import { DbConfig } from './db-config';

@Config()
export class GabConfig {
  @Value('application.host') host: string;

  @Value('application.db') db: string;

  @Bean(DbConfig)
  createDbConfig() {
    return new DbConfig(this.host, this.db);
  }
}
