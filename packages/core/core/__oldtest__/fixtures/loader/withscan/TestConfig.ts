import { Config, Bean, Value } from '../../../../src';

@Config(50)
export class TestConfig {
  @Value('application.name') name: string;

  @Bean('sayHi')
  sayHi() {
    return `hi ${this.name}`;
  }
}
