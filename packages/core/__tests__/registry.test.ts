import { Gabliam, APP_CONFIG, CORE_CONFIG } from '../src';
import * as path from 'path';
import { TestService } from './fixtures/gabliam/service';
import { DbConfig } from './fixtures/gabliam/db-config';
import { TYPE } from '../src/constants';

test('gabliam instance', async () => {
  const gab = new Gabliam({
    scanPath: path.resolve(__dirname, './fixtures/gabliam'),
    configPath: path.resolve(__dirname, './fixtures/gabliam/config')
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
  await gab.destroy();
});
