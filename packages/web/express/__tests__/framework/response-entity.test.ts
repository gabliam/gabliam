import {
  Controller,
  Get,
  ResponseEntity,
  RestController,
} from '@gabliam/web-core';
import { WebPluginTest } from '@gabliam/web-core/src/testing';
import HttpStatus from 'http-status-codes';
import ExpressPlugin from '../../src';

let appTest: WebPluginTest;

beforeEach(async () => {
  appTest = new WebPluginTest([ExpressPlugin]);
});

afterEach(async () => {
  await appTest.destroy();
});

describe('Response entity Tests:', () => {
  [
    { decorator: Controller, name: 'Controller' },
    {
      decorator: RestController,
      name: 'RestController',
    },
  ].forEach(({ decorator, name }) => {
    describe(`decorator ${name}`, () => {
      test('should work for responseEntitie controller methods', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          getTest() {
            return new ResponseEntity({ get: 'GET' });
          }
        }
        appTest.addClass(TestController);
        await appTest.buildAndStart();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(HttpStatus.OK);
        expect(response).toMatchSnapshot();
      });

      test('should work for responseEntitie and custom Header controller methods', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          getTest() {
            const resp = new ResponseEntity({ get: 'GET' });
            resp.addHeader('X-Test', 'tests');
            return resp;
          }
        }
        appTest.addClass(TestController);
        await appTest.buildAndStart();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(HttpStatus.OK);
        expect(response).toMatchSnapshot();
      });

      test('should work for async responseEntitie controller methods', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          async getTest() {
            return new Promise(resolve => {
              setTimeout(resolve, 100, new ResponseEntity({ get: 'GET' }));
            });
          }
        }
        appTest.addClass(TestController);
        await appTest.buildAndStart();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(HttpStatus.OK);
        expect(response).toMatchSnapshot();
      });

      test('responseEntitie ok()', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          async getTest() {
            return ResponseEntity.ok();
          }
        }
        appTest.addClass(TestController);
        await appTest.buildAndStart();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(HttpStatus.OK);
        expect(response).toMatchSnapshot();
      });

      test(`responseEntitie ok({get: 'get'})`, async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          async getTest() {
            return ResponseEntity.ok({ get: 'get' });
          }
        }
        appTest.addClass(TestController);
        await appTest.buildAndStart();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(HttpStatus.OK);
        expect(response).toMatchSnapshot();
      });

      test(`responseEntitie accepted()`, async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          async getTest() {
            return ResponseEntity.accepted();
          }
        }
        appTest.addClass(TestController);
        await appTest.buildAndStart();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(HttpStatus.ACCEPTED);
        expect(response).toMatchSnapshot();
      });

      test(`responseEntitie badRequest()`, async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          async getTest() {
            return ResponseEntity.badRequest();
          }
        }
        appTest.addClass(TestController);
        await appTest.buildAndStart();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(HttpStatus.BAD_REQUEST);
        expect(response).toMatchSnapshot();
      });

      test(`responseEntitie noContent()`, async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          async getTest() {
            return ResponseEntity.noContent();
          }
        }
        appTest.addClass(TestController);
        await appTest.buildAndStart();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(HttpStatus.NO_CONTENT);
        expect(response).toMatchSnapshot();
      });

      test(`responseEntitie notFound()`, async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          async getTest() {
            return ResponseEntity.notFound();
          }
        }
        appTest.addClass(TestController);
        await appTest.buildAndStart();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(HttpStatus.NOT_FOUND);
        expect(response).toMatchSnapshot();
      });
    });
  });
});
