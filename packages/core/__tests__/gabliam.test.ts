// tslint:disable:one-line
// tslint:disable:no-unused-expression

import { Gabliam, APP_CONFIG, CORE_CONFIG } from '../src';
import * as path from 'path';
import { TestService } from './fixtures/gabliam/service';
import { DbConfig } from './fixtures/gabliam/db-config';

describe('Gabliam', () => {
  let gab: Gabliam;
  beforeAll(() => {
    gab = new Gabliam({
      scanPath: path.resolve(__dirname, './fixtures/gabliam'),
      configPath: path.resolve(__dirname, './fixtures/gabliam/config')
    });
  });

  it('gabliam instance', async () => {
    await gab.buildAndStart();
    // @todo write a guid serializer
    // expect(gab).toMatchSnapshot();
    expect(gab.container.get(APP_CONFIG)).toMatchSnapshot();
    expect(gab.container.get(CORE_CONFIG)).toMatchSnapshot();
    expect(gab.container.get(TestService)).toMatchSnapshot();
    expect(gab.container.get(DbConfig)).toMatchSnapshot();
  });

  afterAll(async () => gab.destroy());
});
