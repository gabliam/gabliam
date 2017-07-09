import { Config, Bean, Value } from '../../../../src';

@Config()
export class TestConfig {
  @Value('application.name') name: string;

  @Bean('sayHi')
  sayHi() {
    return `hi ${this.name}`;
  }
}
