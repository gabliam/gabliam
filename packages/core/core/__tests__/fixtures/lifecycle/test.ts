import { Service, preDestroy } from '../../../src';

@Service()
export class Test {
  @preDestroy()
  testPreDestroy() {}
}
