import { reflection } from '@gabliam/core';
import { ConsumeMessage } from 'amqplib';
import { Content, Fields, Message, Properties } from '../../src';

describe('params decorators', () => {
  test.only('should add parameter metadata to a class when decorated with @params', () => {
    class TestController {
      public test(
        @Message() msg: ConsumeMessage,
        @Content('cat') content: string,
        @Properties('headers') req: {},
        @Fields('consumerTag') res: object
      ) {
        return;
      }

      public test2(@Content() content: any) {
        return;
      }
    }
    expect(reflection.parameters(TestController, 'test')).toMatchSnapshot();
    expect(reflection.parameters(TestController, 'test2')).toMatchSnapshot();
  });

  test('should add parameter metadata to a class when decorated with @params and inherit', () => {
    class TestController {
      public test(
        @Message() msg: ConsumeMessage,
        @Content('cat') content: string,
        @Properties('headers') req: {},
        @Fields('consumerTag') res: object
      ) {
        return;
      }

      public test2(@Content() content: any) {
        return;
      }
    }

    class TestController2 extends TestController {
      public test2(@Content('lollol') content: any) {
        return;
      }
    }

    expect(reflection.parameters(TestController2, 'test')).toMatchSnapshot();
    expect(reflection.parameters(TestController2, 'test2')).toMatchSnapshot();
  });
});
