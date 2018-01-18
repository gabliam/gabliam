import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Head,
  Delete,
  All,
  koa,
  KoaConfig,
  Middleware,
  MiddlewareInject
} from '../../src/index';
import { KoaPluginTest } from '../koa-plugin-test';
import { Config } from '@gabliam/core';
import * as sinon from 'sinon';

let appTest: KoaPluginTest;

beforeEach(async () => {
  appTest = new KoaPluginTest();
});

afterEach(async () => {
  await appTest.destroy();
});

describe('Middleware:', () => {
  let result: string;
  const middleware: any = {
    a: async function(ctx: koa.Context, nextFunc: () => Promise<any>) {
      result += 'a';
      await nextFunc();
    },
    b: async function(ctx: koa.Context, nextFunc: () => Promise<any>) {
      result += 'b';
      await nextFunc();
    },
    c: async function(ctx: koa.Context, nextFunc: () => Promise<any>) {
      result += 'c';
      await nextFunc();
    }
  };
  const spyA = sinon.spy(middleware, 'a');
  const spyB = sinon.spy(middleware, 'b');
  const spyC = sinon.spy(middleware, 'c');

  beforeEach(() => {
    result = '';
    spyA.resetHistory();
    spyB.resetHistory();
    spyC.resetHistory();
  });

  test('should call method-level middleware correctly (GET)', async () => {
    @Controller('/')
    class TestController {
      @Get('/', spyA, spyB, spyC)
      public getTest(ctx: koa.Context) {
        ctx.body = 'GET';
      }
    }
    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);

    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (POST)', async () => {
    @Controller('/')
    class TestController {
      @Post('/', spyA, spyB, spyC)
      public postTest(ctx: koa.Context) {
        ctx.body = 'POST';
      }
    }

    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .post('/')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (PUT)', async () => {
    @Controller('/')
    class TestController {
      @Put('/', spyA, spyB, spyC)
      public postTest(ctx: koa.Context) {
        ctx.body = 'PUT';
      }
    }
    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .put('/')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (PATCH)', async () => {
    @Controller('/')
    class TestController {
      @Patch('/', spyA, spyB, spyC)
      public postTest(ctx: koa.Context) {
        ctx.body = 'PATCH';
      }
    }

    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .patch('/')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (HEAD)', async () => {
    @Controller('/')
    class TestController {
      @Head('/', spyA, spyB, spyC)
      public postTest(ctx: koa.Context) {
        ctx.body = 'HEAD';
      }
    }
    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .head('/')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (DELETE)', async () => {
    @Controller('/')
    class TestController {
      @Delete('/', spyA, spyB, spyC)
      public postTest(ctx: koa.Context) {
        ctx.body = 'DELETE';
      }
    }
    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .delete('/')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (ALL)', async () => {
    @Controller('/')
    class TestController {
      @All('/', spyA, spyB, spyC)
      public postTest(ctx: koa.Context) {
        ctx.body = 'ALL';
      }
    }
    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call controller-level middleware correctly', async () => {
    @Controller({
      path: '/',
      middlewares: [spyA, spyB, spyC]
    })
    class TestController {
      @Get('/')
      public getTest(ctx: koa.Context) {
        ctx.body = 'GET';
      }
    }

    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call server-level middleware correctly', async () => {
    @Controller('/')
    class TestController {
      @Get('/')
      public getTest(ctx: koa.Context) {
        ctx.body = 'GET';
      }
    }

    @Config()
    class ServerConfig {
      @KoaConfig()
      serverConfig(app: koa) {
        app.use(spyA);
        app.use(spyB);
        app.use(spyC);
      }
    }

    appTest.addClass(TestController);
    appTest.addClass(ServerConfig);
    await appTest.build();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call all middleware in correct order', async () => {
    @Controller({
      path: '/',
      middlewares: [spyB]
    })
    class TestController {
      @Get('/', spyC)
      public getTest(ctx: koa.Context) {
        ctx.body = 'GET';
      }
    }

    @Config()
    class ServerConfig {
      @KoaConfig()
      serverConfig(app: koa) {
        app.use(spyA);
      }
    }

    appTest.addClass(TestController);
    appTest.addClass(ServerConfig);
    await appTest.build();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should resolve controller-level middleware', async () => {
    const symbolId = Symbol('spyA');
    const strId = 'spyB';

    @Controller({
      path: '/',
      middlewares: [symbolId, strId]
    })
    class TestController {
      @Get('/')
      public getTest(ctx: koa.Context) {
        ctx.body = 'GET';
      }
    }

    appTest.addClass(TestController);
    appTest.gab.container.bind<koa.Middleware>(symbolId).toConstantValue(spyA);
    appTest.gab.container.bind<koa.Middleware>(strId).toConstantValue(spyB);
    await appTest.build();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should resolve method-level middleware', async () => {
    const symbolId = Symbol('spyA');
    const strId = 'spyB';

    @Controller('/')
    class TestController {
      @Get('/', symbolId, strId)
      public getTest(ctx: koa.Context) {
        ctx.body = 'GET';
      }
    }

    appTest.addClass(TestController);
    appTest.gab.container.bind<koa.Middleware>(symbolId).toConstantValue(spyA);
    appTest.gab.container.bind<koa.Middleware>(strId).toConstantValue(spyB);
    await appTest.build();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should compose controller- and method-level middleware', async () => {
    const symbolId = Symbol('spyA');
    const strId = 'spyB';

    @Controller({
      path: '/',
      middlewares: [symbolId]
    })
    class TestController {
      @Get('/', strId)
      public getTest(ctx: koa.Context) {
        ctx.body = 'GET';
      }
    }

    appTest.addClass(TestController);
    appTest.gab.container.bind<koa.Middleware>(symbolId).toConstantValue(spyA);
    appTest.gab.container.bind<koa.Middleware>(strId).toConstantValue(spyB);
    await appTest.build();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(spyA.calledOnce).toBe(true);
    expect(spyB.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });
});

describe('Middleware inject:', () => {
  let result: string;
  let args: string;
  @Config()
  class TestConfig {
    @Middleware('a')
    a() {
      return () => async (ctx: koa.Context, nextFunc: () => Promise<any>) => {
        result += 'a';
        await nextFunc();
      };
    }

    @Middleware('b')
    b() {
      return () => async (ctx: koa.Context, nextFunc: () => Promise<any>) => {
        result += 'b';
        await nextFunc();
      };
    }

    @Middleware('c')
    c(arg?: string) {
      return () => async (ctx: koa.Context, nextFunc: () => Promise<any>) => {
        result += 'c';
        if (arg) {
          args += arg;
        }
        await nextFunc();
      };
    }

    @Middleware('de')
    de() {
      return (arg?: string, arg2?: string) => [
        async (ctx: koa.Context, nextFunc: () => Promise<any>) => {
          result += 'd';
          if (arg) {
            args += 'd' + arg;
          }
          if (arg2) {
            args += 'd' + arg2;
          }
          await nextFunc();
        },
        async (ctx: koa.Context, nextFunc: () => Promise<any>) => {
          result += 'e';
          if (arg) {
            args += 'e' + arg;
          }
          if (arg2) {
            args += 'e' + arg2;
          }
          await nextFunc();
        }
      ];
    }
  }

  beforeEach(() => {
    result = '';
    args = '';
  });

  test('should call method-level middleware correctly (GET)', async () => {
    @Controller('/')
    class TestController {
      @MiddlewareInject('de', 'dearg', 'dearg2')
      @MiddlewareInject('c', 'carg')
      @MiddlewareInject('b')
      @MiddlewareInject('a')
      @Get('/')
      public getTest(ctx: koa.Context) {
        ctx.body = 'GET';
      }
    }

    appTest.addClass(TestConfig);
    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
    expect(args).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (POST)', async () => {
    @Controller('/')
    class TestController {
      @MiddlewareInject('de', 'dearg', 'dearg2')
      @MiddlewareInject('c', 'carg')
      @MiddlewareInject('b')
      @MiddlewareInject('a')
      @Post('/')
      public postTest(ctx: koa.Context) {
        ctx.body = 'POST';
      }
    }

    appTest.addClass(TestConfig);
    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .post('/')
      .expect(200);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
    expect(args).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (PUT)', async () => {
    @Controller('/')
    class TestController {
      @MiddlewareInject('de', 'dearg', 'dearg2')
      @MiddlewareInject('c', 'carg')
      @MiddlewareInject('b')
      @MiddlewareInject('a')
      @Put('/')
      public postTest(ctx: koa.Context) {
        ctx.body = 'PUT';
      }
    }

    appTest.addClass(TestConfig);
    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .put('/')
      .expect(200);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
    expect(args).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (PATCH)', async () => {
    @Controller('/')
    class TestController {
      @MiddlewareInject('de', 'dearg', 'dearg2')
      @MiddlewareInject('c', 'carg')
      @MiddlewareInject('b')
      @MiddlewareInject('a')
      @Patch('/')
      public postTest(ctx: koa.Context) {
        ctx.body = 'PATCH';
      }
    }

    appTest.addClass(TestConfig);
    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .patch('/')
      .expect(200);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
    expect(args).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (HEAD)', async () => {
    @Controller('/')
    class TestController {
      @MiddlewareInject('de', 'dearg', 'dearg2')
      @MiddlewareInject('c', 'carg')
      @MiddlewareInject('b')
      @MiddlewareInject('a')
      @Head('/')
      public postTest(ctx: koa.Context) {
        ctx.body = 'HEAD';
      }
    }
    appTest.addClass(TestConfig);
    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .head('/')
      .expect(200);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
    expect(args).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (DELETE)', async () => {
    @Controller('/')
    class TestController {
      @MiddlewareInject('de', 'dearg', 'dearg2')
      @MiddlewareInject('c', 'carg')
      @MiddlewareInject('b')
      @MiddlewareInject('a')
      @Delete('/')
      public postTest(ctx: koa.Context) {
        ctx.body = 'DELETE';
      }
    }

    appTest.addClass(TestConfig);
    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .delete('/')
      .expect(200);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
    expect(args).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (ALL)', async () => {
    @Controller('/')
    class TestController {
      @MiddlewareInject('de', 'dearg', 'dearg2')
      @MiddlewareInject('c', 'carg')
      @MiddlewareInject('b')
      @MiddlewareInject('a')
      @All('/')
      public postTest(ctx: koa.Context) {
        ctx.body = 'ALL';
      }
    }

    appTest.addClass(TestConfig);
    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
    expect(args).toMatchSnapshot();
  });

  test('should call controller-level middleware correctly', async () => {
    @MiddlewareInject('de', 'dearg', 'dearg2')
    @MiddlewareInject('c', 'carg')
    @MiddlewareInject('b')
    @MiddlewareInject('a')
    @Controller({
      path: '/'
    })
    class TestController {
      @Get('/')
      public getTest(ctx: koa.Context) {
        ctx.body = 'GET';
      }
    }

    appTest.addClass(TestConfig);
    appTest.addClass(TestController);
    await appTest.build();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
    expect(args).toMatchSnapshot();
  });

  test('should call all middleware in correct order', async () => {
    @MiddlewareInject('b')
    @MiddlewareInject('a')
    @Controller({
      path: '/'
    })
    class TestController {
      @MiddlewareInject('de', 'dearg', 'dearg2')
      @MiddlewareInject('c', 'carg')
      @Get('/')
      public getTest(ctx: koa.Context) {
        ctx.body = 'GET';
      }
    }

    appTest.addClass(TestController);
    appTest.addClass(TestConfig);
    await appTest.build();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
    expect(args).toMatchSnapshot();
  });
});
