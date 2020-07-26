import { Service, Scan } from '../../../../src';
import path from 'path';

@Scan(path.resolve(__dirname, '../subfoldertoscan'))
@Service()
export class TestService {}
