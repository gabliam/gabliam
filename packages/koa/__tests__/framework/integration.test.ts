import {
  Controller,
  RestController,
  Get,
  Post,
  Put,
  Patch,
  Head,
  Delete,
  Method,
  koaRouter
} from '../../src/index';
import { KoaPluginTest } from '../koa-plugin-test';
import { Config, Bean } from '@gabliam/core';
import { CUSTOM_ROUTER_CREATOR } from '../../src/constants';

let appTest: KoaPluginTest;

beforeEach(async () => {
  appTest = new KoaPluginTest();
});

afterEach(async () => {
  await appTest.destroy();
});

describe('Integration Tests:', () => {
  [Controller, RestController].forEach(decorator => {
    describe(`decorator ${decorator.name}`, () => {
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
        const response = await appTest
          .supertest()
          .get('/')
          .expect(200);
        expect(response).toMatchSnapshot();
      });

      test('should work for async controller methods that fails', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          public getTest() {
            return new Promise((resolve, reject) => {
              setTimeout(reject, 100, 'GET');
            });
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(500);
        expect(response).toMatchSnapshot();
      });

      test('should work for methods which call nextFunc()', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          public async getTest(
            ctx: koaRouter.IRouterContext,
            nextFunc: () => Promise<any>
          ) {
            await nextFunc();
          }

          @Get('/')
          public getTest2(ctx: koaRouter.IRouterContext) {
            return 'GET';
          }
        }

        appTest.addClass(TestController);
        await appTest.build();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(200);
        expect(response).toMatchSnapshot();
      });

      test('should work for async methods which call nextFunc()', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          public getTest(
            ctx: koaRouter.IRouterContext,
            nextFunc: () => Promise<any>
          ) {
            return new Promise(resolve => {
              setTimeout(
                () => {
                  resolve(nextFunc());
                },
                100,
                'GET'
              );
            });
          }

          @Get('/')
          public getTest2(ctx: koaRouter.IRouterContext) {
            return 'GET';
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(200);
        expect(response).toMatchSnapshot();
      });

      test('should work for async methods called by nextFunc()', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          public async getTest(
            ctx: koaRouter.IRouterContext,
            nextFunc: () => Promise<any>
          ) {
            await nextFunc();
          }

          @Get('/')
          public getTest2(ctx: koaRouter.IRouterContext) {
            return new Promise(resolve => {
              setTimeout(resolve, 100, 'GET');
            });
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
        const response = await appTest
          .supertest()
          .get('/')
          .expect(200);
        expect(response).toMatchSnapshot();
      });

      test('should work for each shortcut decorator', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          public getTest(ctx: koaRouter.IRouterContext) {
            ctx.body = 'GET';
          }
          @Post('/')
          public postTest(ctx: koaRouter.IRouterContext) {
            ctx.body = 'POST';
          }
          @Put('/')
          public putTest(ctx: koaRouter.IRouterContext) {
            ctx.body = 'PUT';
          }
          @Patch('/')
          public patchTest(ctx: koaRouter.IRouterContext) {
            ctx.body = 'PATCH';
          }
          @Head('/')
          public headTest(ctx: koaRouter.IRouterContext) {
            ctx.body = 'HEAD';
          }
          @Delete('/')
          public deleteTest(ctx: koaRouter.IRouterContext) {
            ctx.body = 'DELETE';
          }
        }
        appTest.addClass(TestController);
        await appTest.build();
        const agent = appTest.supertest();

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
          @Method('propfind', '/')
          public getTest(ctx: koaRouter.IRouterContext) {
            ctx.body = 'PROPFIND';
          }
        }

        appTest.addClass(TestController);
        await appTest.build();

        const response = await appTest
          .supertest()
          .propfind('/')
          .expect(200);
        expect(response).toMatchSnapshot();
      });

      test('should use returned values as response', async () => {
        @decorator('/')
        class TestController {
          @Get('/')
          public getTest(ctx: koaRouter.IRouterContext) {
            return { hello: 'world' };
          }
        }

        appTest.addClass(TestController);
        await appTest.build();

        const response = await appTest
          .supertest()
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
            return (prefix: string) =>
              new koaRouter({
                prefix,
                sensitive: true
              });
          }
        }
        appTest.addClass(Conf);
        appTest.addClass(TestController);
        await appTest.build();

        const agent = appTest.supertest();

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
        appTest.addConf('application.koa.rootPath', '/api/v1');
        await appTest.build();

        const response = await appTest
          .supertest()
          .get('/api/v1/ping/endpoint')
          .expect(200);

        expect(response).toMatchSnapshot();
      });
    });
  });
});
