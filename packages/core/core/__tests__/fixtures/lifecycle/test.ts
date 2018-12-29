import { Service, PreDestroy } from '../../../src';

@Service()
export class Test {
  @PreDestroy()
  testPreDestroy() {}
}
