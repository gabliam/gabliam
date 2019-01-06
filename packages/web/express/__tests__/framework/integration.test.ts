import { Bean, Config } from '@gabliam/core';
import {
  Controller,
  Delete,
  Get,
  Head,
  CustomMethod,
  Next,
  nextFn,
  Patch,
  Post,
  Put,
  RestController,
} from '@gabliam/web-core';
import * as supertest from 'supertest';
import { express as e } from '../../src';
import { CUSTOM_ROUTER_CREATOR } from '../../src/constants';
import { ExpressPluginTest } from '../express-plugin-test';

let appTest: ExpressPluginTest;

beforeEach(async () => {
  appTest = new ExpressPluginTest();
});

afterEach(async () => {
  await appTest.destroy();
});

describe('Integration Tests:', () => {
  [
    { decorator: Controller, name: 'Controller' },
    {
      decorator: RestController,
      name: 'RestController',
    },
  ].forEach(({ decorator, name }) => {
    describe(`decorator ${name}`, () => {
      test('should work with config', async () => {
        @decorator('rest.test.base')
        class TestController {
          @Get('rest.test.get')
          async getTest() {
            return 'config ok !!!!';
          }
        }

        appTest.addClass(TestController);
        appTest.addConf('rest.test', {
          base: '/test',
          get: '/',
        });
        appTest.addClass(TestController);
        await appTest.build();
        const response = await supertest(appTest.app)
          .get('/test')
          .expect(200);
        expect(response).toMatchSnapshot();
      });

      test('should work for async controller methods', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          async getTest() {
            return new Promise(resolve => {
              setTimeout(resolve, 100, 'GET');
            });
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
        const response = await supertest(appTest.app)
          .get('/')
          .expect(200);
        expect(response).toMatchSnapshot();
      });

      test('should work for async controller methods that fails', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          public getTest() {
            return new Promise((_, reject) => {
              setTimeout(reject, 100, 'GET');
            });
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
        const response = await supertest(appTest.app)
          .get('/')
          .expect(500);
        expect(response).toMatchSnapshot();
      });

      test('should work for methods which call nextFunc()', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          public getTest(@Next() nextFunc: nextFn) {
            return nextFunc();
          }

          @Get('/')
          public getTest2() {
            return 'GET';
          }
        }

        appTest.addClass(TestController);
        await appTest.build();
        const response = await supertest(appTest.app)
          .get('/')
          .expect(200);
        expect(response).toMatchSnapshot();
      });

      test('should work for async methods which call nextFunc()', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          public getTest(@Next() nextFunc: nextFn) {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(nextFunc());
              }, 100);
            });
          }

          @Get('/')
          public getTest2() {
            return 'GET';
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
        const response = await supertest(appTest.app)
          .get('/')
          .expect(200);
        expect(response).toMatchSnapshot();
      });

      test('should work for async methods called by nextFunc()', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          public getTest(@Next() nextFunc: nextFn) {
            return nextFunc();
          }

          @Get('/')
          public getTest2() {
            return new Promise(resolve => {
              setTimeout(() => resolve('GET'), 100);
            });
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
        const response = await supertest(appTest.app)
          .get('/')
          .expect(200);
        expect(response).toMatchSnapshot();
      });

      test('should work for each shortcut decorator', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          public getTest() {
            return 'GET';
          }
          @Post('/')
          public postTest() {
            return 'POST';
          }
          @Put('/')
          public putTest() {
            return 'PUT';
          }
          @Patch('/')
          public patchTest() {
            return 'PATCH';
          }
          @Head('/')
          public headTest() {
            return 'HEAD';
          }
          @Delete('/')
          public deleteTest() {
            return 'DELETE';
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
        const agent = supertest(appTest.app);

        const rd = await agent.delete('/').expect(200);
        expect(rd).toMatchSnapshot();

        const rh = await agent.head('/').expect(200);
        expect(rh).toMatchSnapshot();

        const rpatch = await agent.patch('/').expect(200);
        expect(rpatch).toMatchSnapshot();

        const rput = await agent.put('/').expect(200);
        expect(rput).toMatchSnapshot();

        const rpost = await agent.post('/').expect(200);
        expect(rpost).toMatchSnapshot();

        const rget = await agent.get('/').expect(200);
        expect(rget).toMatchSnapshot();
      });

      test('should work for more obscure HTTP methods using the httpMethod decorator', async () => {
        @decorator('/')
        class TestController {
          @CustomMethod('propfind', '/')
          public getTest() {
            return 'PROPFIND';
          }
        }

        appTest.addClass(TestController);
        await appTest.build();

        const response = await supertest(appTest.app)
          .propfind('/')
          .expect(200);
        expect(response).toMatchSnapshot();
      });

      test('should use returned values as response', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          public getTest() {
            return { hello: 'world' };
          }
        }

        appTest.addClass(TestController);
        await appTest.build();

        const response = await supertest(appTest.app)
          .get('/')
          .expect(200);
        expect(response).toMatchSnapshot();
      });

      test('should use custom router passed from configuration', async () => {
        @decorator('/CaseSensitive')
        class TestController {
          @Get('/Endpoint')
          public get() {
            return 'Such Text';
          }
        }

        @Config()
        class Conf {
          @Bean(CUSTOM_ROUTER_CREATOR)
          custom() {
            return () =>
              e.Router({
                caseSensitive: true,
              });
          }
        }
        appTest.addClass(Conf);
        appTest.addClass(TestController);
        await appTest.build();

        const agent = supertest(appTest.app);

        const expectedSuccess = await agent
          .get('/CaseSensitive/Endpoint')
          .expect(200);

        expect(expectedSuccess).toMatchSnapshot();

        const expectedNotFound1 = await agent
          .get('/casesensitive/endpoint')
          .expect(404);

        expect(expectedNotFound1).toMatchSnapshot();

        const expectedNotFound2 = await agent
          .get('/CaseSensitive/endpoint')
          .expect(404);

        expect(expectedNotFound2).toMatchSnapshot();
      });

      test('should use custom routing configuration', async () => {
        @decorator('/ping')
        class TestController {
          @Get('/endpoint')
          public get() {
            return 'pong';
          }
        }

        appTest.addClass(TestController);
        appTest.addConf('application.web.rootPath', '/api/v1');
        appTest.addConf('application.web.bodyParser.text', true);
        await appTest.build();

        const response = await supertest(appTest.app)
          .get('/api/v1/ping/endpoint')
          .expect(200);

        expect(response).toMatchSnapshot();
      });
    });
  });
});
