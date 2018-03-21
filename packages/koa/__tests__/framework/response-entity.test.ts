import {
  Controller,
  RestController,
  Get,
  ResponseEntity,
  ok,
  accepted,
  badRequest,
  noContent,
  notFound
} from '../../src';
import { KoaPluginTest } from '../koa-plugin-test';
import * as HttpStatus from 'http-status-codes';

let appTest: KoaPluginTest;

beforeEach(async () => {
  appTest = new KoaPluginTest();
});

afterEach(async () => {
  await appTest.destroy();
});

describe('Response entity Tests:', () => {
  [Controller, RestController].forEach(decorator => {
    describe(`decorator ${decorator.name}`, () => {
      test('should work for responseEntitie controller methods', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          getTest() {
            return new ResponseEntity({ get: 'GET' });
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
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
        await appTest.build();
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
            // console.log('ici');
            return new Promise(resolve => {
              setTimeout(resolve, 100, new ResponseEntity({ get: 'GET' }));
            });
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
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
            return ok();
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
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
            return ok({ get: 'get' });
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
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
            return accepted();
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
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
            return badRequest();
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
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
            return noContent();
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
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
            return notFound();
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(HttpStatus.NOT_FOUND);
        expect(response).toMatchSnapshot();
      });
    });
  });
});
