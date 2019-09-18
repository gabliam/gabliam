import { Controller, Get, QueryParam } from '@gabliam/web-core';
import { WebPluginTest } from '@gabliam/web-core/src/testing';
import ExpressPlugin from '../../src';

let appTest: WebPluginTest;

beforeEach(async () => {
  appTest = new WebPluginTest([ExpressPlugin]);
});

afterEach(async () => {
  await appTest.destroy();
});

describe('Bugfix', () => {
  describe(`#3 Can't use number as default parameter value in rest controller`, () => {
    test('QueryParam', async () => {
      @Controller('/')
      class TestController {
        @Get('/')
        public getTest(@QueryParam('id') id: number = 10) {
          expect(id).toEqual(10);
          return [typeof id, id];
        }
      }

      appTest.addClass(TestController);
      await appTest.buildAndStart();
      const response = await appTest
        .supertest()
        .get('/')
        .expect(200);
      expect(response).toMatchSnapshot();
    });
  });
});
