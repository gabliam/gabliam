import { RegistryMetada } from '@gabliam/core/lib/interfaces';
import { METADATA_KEY as CORE_METADATA_KEY } from '@gabliam/core/lib/constants';
import { METADATA_KEY } from '../src/constants';
import {
  RabbitController,
  RabbitListener,
  RabbitHandlerMetadata,
  RabbitConsumer
} from '../src/index';

test(`@RabbitController() decorator`, () => {
  @RabbitController()
  class RabbitControllerTest {}

  const entityMetadata: RegistryMetada = Reflect.getMetadata(
    CORE_METADATA_KEY.register,
    RabbitControllerTest
  );

  const documentMetadata: boolean = Reflect.getOwnMetadata(
    METADATA_KEY.RabbitController,
    RabbitControllerTest
  );

  expect(entityMetadata).toMatchSnapshot();
  expect(documentMetadata).toMatchSnapshot();
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

  const entityMetadata: RegistryMetada = Reflect.getMetadata(
    CORE_METADATA_KEY.register,
    RabbitControllerTest
  );

  const documentMetadata: boolean = Reflect.getOwnMetadata(
    METADATA_KEY.RabbitController,
    RabbitControllerTest
  );

  const handlerMetadatas: RabbitHandlerMetadata[] = Reflect.getOwnMetadata(
    METADATA_KEY.RabbitHandler,
    RabbitControllerTest
  );

  expect(entityMetadata).toMatchSnapshot();
  expect(documentMetadata).toMatchSnapshot();
  expect(handlerMetadatas).toMatchSnapshot();
});

test(`@RabbitConsumer() decorator`, () => {
  @RabbitController()
  class RabbitControllerTest {
    @RabbitConsumer('consumerTest')
    consumer() {}
  }

  const entityMetadata: RegistryMetada = Reflect.getMetadata(
    CORE_METADATA_KEY.register,
    RabbitControllerTest
  );

  const documentMetadata: boolean = Reflect.getOwnMetadata(
    METADATA_KEY.RabbitController,
    RabbitControllerTest
  );

  const handlerMetadatas: RabbitHandlerMetadata[] = Reflect.getOwnMetadata(
    METADATA_KEY.RabbitHandler,
    RabbitControllerTest
  );

  expect(entityMetadata).toMatchSnapshot();
  expect(documentMetadata).toMatchSnapshot();
  expect(handlerMetadatas).toMatchSnapshot();
});

test(`@RabbitListener() & @RabbitConsumer() decorator`, () => {
  @RabbitController()
  class RabbitControllerTest {
    @RabbitListener('listenerTest')
    listener() {}

    @RabbitConsumer('consumerTest')
    consumer() {}
  }

  const entityMetadata: RegistryMetada = Reflect.getMetadata(
    CORE_METADATA_KEY.register,
    RabbitControllerTest
  );

  const documentMetadata: boolean = Reflect.getOwnMetadata(
    METADATA_KEY.RabbitController,
    RabbitControllerTest
  );

  const handlerMetadatas: RabbitHandlerMetadata[] = Reflect.getOwnMetadata(
    METADATA_KEY.RabbitHandler,
    RabbitControllerTest
  );

  expect(entityMetadata).toMatchSnapshot();
  expect(documentMetadata).toMatchSnapshot();
  expect(handlerMetadatas).toMatchSnapshot();
});
