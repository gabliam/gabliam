import { preDestroy } from '../../../src';

export class Test2 {
  @preDestroy()
  testPreDestroy2() {}
}
