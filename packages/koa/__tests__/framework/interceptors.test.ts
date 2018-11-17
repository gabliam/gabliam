import {
  Config,
  Container,
  getMetadata,
  ReflectMetadata,
  Service,
} from '@gabliam/core';
import { koa, KoaConverter, toInterceptor } from '@gabliam/koa';
import {
  All,
  Controller,
  Delete,
  ExecContext,
  ExecutionContext,
  Get,
  Head,
  Interceptor,
  Patch,
  Post,
  Put,
  UseInterceptors,
  WebConfig,
} from '@gabliam/web-core';
import * as sinon from 'sinon';
import { KoaPluginTest } from '../koa-plugin-test';

let appTest: KoaPluginTest;

beforeEach(async () => {
  appTest = new KoaPluginTest();
});

afterEach(async () => {
  await appTest.destroy();
});

describe('Middleware:', () => {
  let result: string;

  @Service()
  class A implements Interceptor {
    intercept() {
      result += 'a';
    }
  }

  async function b(ctx: koa.Context, nextFunc: () => Promise<any>) {
    result += 'b';
    await nextFunc();
  }

  const B = toInterceptor(b);

  @Service()
  class C implements Interceptor {
    intercept() {
      result += 'c';
    }
  }

  const spyA = sinon.spy(A.prototype, 'intercept');
  const spyB = sinon.spy(B.prototype, 'intercept');
  const spyC = sinon.spy(C.prototype, 'intercept');

  beforeEach(() => {
    result = '';
    appTest.addClass(A);
    appTest.addClass(B);
    appTest.addClass(C);
    spyA.resetHistory();
    spyB.resetHistory();
    spyC.resetHistory();
  });

  test('should call method-level middleware correctly (GET)', async () => {
    @Controller('/')
    class TestController {
      @UseInterceptors(A, B, C)
      @Get('/')
      public getTest() {
        return 'GET';
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
      @UseInterceptors(A, B, C)
      @Post('/')
      public postTest() {
        return 'POST';
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
      @UseInterceptors(A, B, C)
      @Put('/')
      public postTest(ctx: koa.Context) {
        return 'PUT';
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
      @UseInterceptors(A, B, C)
      @Patch('/')
      public postTest(ctx: koa.Context) {
        return 'PATCH';
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
      @UseInterceptors(A, B, C)
      @Head('/')
      public postTest() {
        return 'HEAD';
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
      @UseInterceptors(A, B, C)
      @Delete('/')
      public postTest() {
        return 'DELETE';
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
      @UseInterceptors(A, B, C)
      @All('/')
      public postTest() {
        return 'ALL';
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
    @UseInterceptors(A, B, C)
    @Controller({
      path: '/',
    })
    class TestController {
      @Get('/')
      public getTest() {
        return 'GET';
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
      public getTest() {
        return 'GET';
      }
    }

    @Config()
    class ServerConfig {
      @WebConfig()
      serverConfig(app: koa, container: Container) {
        const converter = container.get(KoaConverter);
        app.use(converter.interceptorToMiddleware(A));
        app.use(b);
        app.use(converter.interceptorToMiddleware(C));
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
    expect(spyC.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });

  test('should call all middleware in correct order', async () => {
    @UseInterceptors(B)
    @Controller({
      path: '/',
    })
    class TestController {
      @UseInterceptors(C)
      @Get('/')
      public getTest() {
        return 'GET';
      }
    }

    @Config()
    class ServerConfig {
      @WebConfig()
      serverConfig(app: koa, container: Container) {
        const converter = container.get(KoaConverter);
        app.use(converter.interceptorToMiddleware(A));
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

    @UseInterceptors(symbolId, strId)
    @Controller({
      path: '/',
    })
    class TestController {
      @Get('/')
      public getTest() {
        return 'GET';
      }
    }

    appTest.addClass(TestController);
    appTest.gab.container
      .bind(symbolId)
      .to(A)
      .inSingletonScope();
    appTest.gab.container
      .bind(strId)
      .to(B)
      .inSingletonScope();
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
      @UseInterceptors(symbolId, strId)
      @Get('/')
      public getTest() {
        return 'GET';
      }
    }

    appTest.addClass(TestController);
    appTest.gab.container
      .bind(symbolId)
      .to(A)
      .inSingletonScope();
    appTest.gab.container
      .bind(strId)
      .to(B)
      .inSingletonScope();
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

    @UseInterceptors(symbolId)
    @Controller({
      path: '/',
    })
    class TestController {
      @UseInterceptors(strId)
      @Get('/')
      public getTest() {
        return 'GET';
      }
    }

    appTest.addClass(TestController);
    appTest.gab.container
      .bind(symbolId)
      .to(A)
      .inSingletonScope();
    appTest.gab.container
      .bind(strId)
      .to(B)
      .inSingletonScope();
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
  @Service()
  class A implements Interceptor {
    intercept() {
      result += 'a';
    }
  }

  @Service()
  class B implements Interceptor {
    intercept() {
      result += 'b';
    }
  }

  @Service()
  class C implements Interceptor {
    intercept(@ExecContext() execCtx: ExecutionContext) {
      result += 'c';
      const argsCtx = getMetadata<string[]>('args', execCtx.getHandler());
      if (argsCtx) {
        args += argsCtx;
      }
    }
  }

  @Service()
  class D implements Interceptor {
    intercept(@ExecContext() execCtx: ExecutionContext) {
      result += 'd';
      const argsCtx = getMetadata<string[]>('args2', execCtx.getHandler());
      if (argsCtx) {
        args += argsCtx.join('');
      }
    }
  }

  const AddArgs = (...s: string[]) => ReflectMetadata('args', s);
  const AddArgs2 = (...s: string[]) => ReflectMetadata('args2', s);

  beforeEach(() => {
    result = '';
    args = '';
    appTest
      .addClass(A)
      .addClass(B)
      .addClass(C)
      .addClass(D);
  });

  test('should call method-level middleware correctly (GET)', async () => {
    @Controller('/')
    class TestController {
      @UseInterceptors(A, B, C, D)
      @AddArgs('carg')
      @AddArgs2('dearg', 'dearg2')
      @Get('/')
      public getTest() {
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
    expect(result).toMatchSnapshot();
    expect(args).toMatchSnapshot();
  });

  test('should call method-level middleware correctly (POST)', async () => {
    @Controller('/')
    class TestController {
      @UseInterceptors(A, B, C, D)
      @AddArgs('carg')
      @AddArgs2('dearg', 'dearg2')
      @Post('/')
      public postTest() {
        return 'POST';
      }
    }

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
      @UseInterceptors(A, B, C, D)
      @AddArgs('carg')
      @AddArgs2('dearg', 'dearg2')
      @Put('/')
      public postTest() {
        return 'PUT';
      }
    }

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
      @UseInterceptors(A, B, C, D)
      @AddArgs('carg')
      @AddArgs2('dearg', 'dearg2')
      @Patch('/')
      public postTest() {
        return 'PATCH';
      }
    }

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
      @UseInterceptors(A, B, C, D)
      @AddArgs('carg')
      @AddArgs2('dearg', 'dearg2')
      @Head('/')
      public postTest() {
        return 'HEAD';
      }
    }
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
      @UseInterceptors(A, B, C, D)
      @AddArgs('carg')
      @AddArgs2('dearg', 'dearg2')
      @Delete('/')
      public postTest() {
        return 'DELETE';
      }
    }

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
      @UseInterceptors(A, B, C, D)
      @AddArgs('carg')
      @AddArgs2('dearg', 'dearg2')
      @All('/')
      public postTest() {
        return 'ALL';
      }
    }

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
    @UseInterceptors(A, B, C, D)
    @AddArgs('carg')
    @AddArgs2('dearg', 'dearg2')
    @Controller({
      path: '/',
    })
    class TestController {
      @Get('/')
      public getTest() {
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
    expect(result).toMatchSnapshot();
    expect(args).toMatchSnapshot();
  });

  test('should call all middleware in correct order', async () => {
    @UseInterceptors(A, B)
    @Controller({
      path: '/',
    })
    class TestController {
      @UseInterceptors(C, D)
      @AddArgs('carg')
      @AddArgs2('dearg', 'dearg2')
      @Get('/')
      public getTest() {
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
    expect(result).toMatchSnapshot();
    expect(args).toMatchSnapshot();
  });
});
