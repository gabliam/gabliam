import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'photo.sqlite',
  synchronize: true,
  logging: false,
  entities: ['./src/entities/**/*.ts']
});
