import { Content, Fields, Message, Properties } from '../../src';
import { METADATA_KEY } from '../../src/constants';
import { RabbitHandlerParameterMetadata } from '../../src/interfaces';
import { ConsumeMessage } from 'amqplib';

describe('params decorators', () => {
  test('should add parameter metadata to a class when decorated with @params', () => {
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
    const methodMetadataList: RabbitHandlerParameterMetadata = Reflect.getMetadata(
      METADATA_KEY.RabbitcontrollerParameter,
      TestController
    );
    expect(methodMetadataList).toMatchSnapshot();
  });
});
