import { Service } from '../../../src/index';
import { DbConfig } from './db-config';

@Service()
export class TestService {
  constructor(public dbConfig: DbConfig) {}
}
