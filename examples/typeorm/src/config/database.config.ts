import { Bean, Config, Init } from '@gabliam/core';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

@Config()
export class DatabaseConfig {
  appDataSource = AppDataSource;

  @Bean(DataSource)
  createDatasource() {
    return this.appDataSource;
  }

  @Init()
  async startDatabase() {
    await this.appDataSource.initialize();
  }
}
