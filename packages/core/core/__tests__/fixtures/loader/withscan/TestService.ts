import { Service, Scan } from '../../../../src';
import * as path from 'path';

@Scan(path.resolve(__dirname, '../subfoldertoscan'))
@Service()
export class TestService {}
