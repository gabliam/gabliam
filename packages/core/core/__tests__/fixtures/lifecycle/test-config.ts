import { Bean } from '../../../src';
import { Config } from '@gabliam/core';
import { Test2 } from './test2';

@Config()
export class TestConfig {
  @Bean(Test2)
  createTest2() {
    return new Test2();
  }
}
