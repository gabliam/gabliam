import path from 'path';
import { Scan, Service } from '../../../../src';

@Scan(path.resolve(__dirname, '../subfoldertoscan'))
@Service()
export class TestService {}
