import path from 'path';
import { APP_CONFIG, CORE_CONFIG, Gabliam } from '../src';
import { TYPE } from '../src/constants';
import { DbConfig } from './fixtures/gabliam/db-config';
import { TestService } from './fixtures/gabliam/service';

test('gabliam instance', async () => {
  const gab = new Gabliam({
    scanPath: path.resolve(__dirname, './fixtures/gabliam'),
    config: path.resolve(__dirname, './fixtures/gabliam/config'),
  });
  await gab.buildAndStart();
  // @todo write a guid serializer
  // expect(gab).toMatchSnapshot();
  expect(gab.container.get(APP_CONFIG)).toMatchSnapshot();
  expect(gab.container.get(CORE_CONFIG)).toMatchSnapshot();
  expect(gab.container.get(TestService)).toMatchSnapshot();
  expect(gab.container.get(DbConfig)).toMatchSnapshot();
  expect(gab.registry).toMatchSnapshot();
  gab.registry.remove(TYPE.Service);
  expect(gab.registry).toMatchSnapshot();
  gab.registry.remove(TYPE.Config);
  expect(gab.registry).toMatchSnapshot();
  await gab.stopAndDestroy();
});
