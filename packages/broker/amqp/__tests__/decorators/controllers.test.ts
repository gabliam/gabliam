import { reflection } from '@gabliam/core/src';
import {
  RabbitConsumer,
  RabbitController,
  RabbitListener,
} from '../../src/index';

test(`@RabbitController() decorator`, () => {
  @RabbitController()
  class RabbitControllerTest {}

  expect(reflection.annotations(RabbitControllerTest)).toMatchSnapshot();
});

test('should fail when decorated multiple times the same class with @RabbitController', () => {
  expect(() => {
    @RabbitController()
    @RabbitController()
    class RabbitControllerTest {}
    // tslint:disable-next-line:no-unused-expression
    new RabbitControllerTest();
  }).toThrowError();
});

test(`@RabbitListener() decorator`, () => {
  @RabbitController()
  class RabbitControllerTest {
    @RabbitListener('listenerTest')
    listener() {}
  }

  expect(reflection.annotations(RabbitControllerTest)).toMatchSnapshot();
  expect(reflection.propMetadata(RabbitControllerTest)).toMatchSnapshot();
});

test(`@RabbitConsumer() decorator`, () => {
  @RabbitController()
  class RabbitControllerTest {
    @RabbitConsumer('consumerTest')
    consumer() {}
  }

  expect(reflection.annotations(RabbitControllerTest)).toMatchSnapshot();
  expect(reflection.propMetadata(RabbitControllerTest)).toMatchSnapshot();
});

test(`@RabbitListener() & @RabbitConsumer() decorator`, () => {
  @RabbitController()
  class RabbitControllerTest {
    @RabbitListener('listenerTest')
    listener() {}

    @RabbitConsumer('consumerTest')
    consumer() {}
  }

  expect(reflection.annotations(RabbitControllerTest)).toMatchSnapshot();
  expect(reflection.propMetadata(RabbitControllerTest)).toMatchSnapshot();
});
