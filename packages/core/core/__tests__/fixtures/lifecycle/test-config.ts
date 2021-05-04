import { Config } from '@gabliam/core';
import { Bean } from '../../../src';
import { Test2 } from './test2';

@Config()
export class TestConfig {
  @Bean(Test2)
  createTest2() {
    return new Test2();
  }
}
