import { Gabliam } from '../src';
import path from 'path';
import sinon from 'sinon';
import { Test } from './fixtures/lifecycle/test';
import { Test2 } from './fixtures/lifecycle/test2';

test('@preDestroy test', async () => {
  // Test with @Service
  const testPreDestroy = sinon.spy(Test.prototype, 'testPreDestroy');

  // Test with @Bean
  const testPreDestroy2 = sinon.spy(Test2.prototype, 'testPreDestroy2');

  const g = new Gabliam({
    scanPath: path.resolve(__dirname, './fixtures/lifecycle'),
  });
  await g.buildAndStart();
  expect(testPreDestroy.callCount).toMatchSnapshot();
  expect(testPreDestroy2.callCount).toMatchSnapshot();
  g.container.get(Test);
  await g.stop();
  await g.destroy();
  expect(testPreDestroy.callCount).toMatchSnapshot();
  expect(testPreDestroy2.callCount).toMatchSnapshot();
});
