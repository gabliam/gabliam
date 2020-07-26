import {
  Config,
  Container,
  getMetadata,
  ReflectMetadata,
  Service,
} from '@gabliam/core';
import {
  All,
  Controller,
  Delete,
  ExecContext,
  ExecutionContext,
  GabResponse,
  Get,
  Head,
  Interceptor,
  Next,
  nextFn,
  Patch,
  Post,
  Put,
  RequestParam,
  Response,
  UseInterceptors,
  WebConfig,
  WebConfiguration,
} from '@gabliam/web-core';
import { WebPluginTest } from '@gabliam/web-core/src/testing';
import sinon from 'sinon';
import ExpressPlugin, {
  express as e,
  ExpressConverter,
  toInterceptor,
  UseExpressInterceptors,
} from '../../src';

let appTest: WebPluginTest;

beforeEach(async () => {
  appTest = new WebPluginTest([ExpressPlugin]);
});

afterEach(async () => {
  await appTest.destroy();
});

describe('Complex interceptor', () => {
  let result: string;
  @Service()
  class A implements Interceptor {
    async intercept(@Next() next: nextFn) {
      result += 'a';
      await next();
      result += 'b';
    }
  }

  const spyA = sinon.spy(A.prototype, 'intercept');
  beforeEach(() => {
    result = '';
    spyA.resetHistory();
  });

  test('should call method-level interceptor correctly (GET)', async () => {
    @Controller('/')
    class TestController {
      @UseInterceptors(A)
      @Get('/')
      public getTest() {
        return 'GET';
      }
    }
    appTest.addClass(TestController);
    await appTest.buildAndStart();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);

    expect(spyA.calledOnce).toBe(true);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });
});

describe('Interceptors:', () => {
  let result: string;

  @Service()
  class A implements Interceptor {
    intercept() {
      result += 'a';
    }
  }

  function b(req: e.Request, res: e.Response, nextFunc: e.NextFunction) {
    result += 'b';
    nextFunc();
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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
      public postTest() {
        return 'PUT';
      }
    }
    appTest.addClass(TestController);
    await appTest.buildAndStart();

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
      public postTest() {
        return 'PATCH';
      }
    }

    appTest.addClass(TestController);
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
      serverConfig(app: e.Application, container: Container) {
        const converter = container.get(ExpressConverter);
        app.use(converter.interceptorToMiddleware(A));
        app.use(b);
        app.use(converter.interceptorToMiddleware(C));
      }
    }

    appTest.addClass(TestController);
    appTest.addClass(ServerConfig);
    await appTest.buildAndStart();

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
      serverConfig(app: e.Application, container: Container) {
        const converter = container.get(ExpressConverter);
        app.use(converter.interceptorToMiddleware(A));
      }
    }

    appTest.addClass(TestController);
    appTest.addClass(ServerConfig);
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

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
    await appTest.buildAndStart();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    expect(response).toMatchSnapshot();
    expect(result).toMatchSnapshot();
    expect(args).toMatchSnapshot();
  });
});

describe('ToInterceptor', () => {
  let result: string;
  beforeEach(() => {
    result = '';
  });

  describe('express middleware with next function', () => {
    test('without errors', async () => {
      const mid: e.RequestHandler = (req, res, next) => {
        result += 'mid';
        next();
      };

      @UseExpressInterceptors(mid)
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
      await appTest.buildAndStart();

      const response = await appTest
        .supertest()
        .get('/')
        .expect(200);
      expect(response).toMatchSnapshot();
      expect(result).toMatchSnapshot();
    });

    test('with errors', async () => {
      const mid: e.RequestHandler = (req, res, next) => {
        result += 'midError';
        next(new Error('Error'));
      };

      @UseExpressInterceptors(mid)
      @Controller({
        path: '/',
      })
      class TestController {
        @Get('/')
        public getTest() {
          return 'GET';
        }
      }

      const spyCtl = sinon.spy(TestController.prototype, 'getTest');

      appTest.addClass(TestController);
      await appTest.buildAndStart();

      await appTest
        .supertest()
        .get('/')
        .expect(500);
      expect(result).toMatchSnapshot();
      expect(spyCtl.notCalled).toBeTruthy();
    });
  });

  describe('express middleware without next function', () => {
    test('without errors', async () => {
      const mid: e.RequestHandler = (req, res) => {
        result += 'mid';
      };

      @UseExpressInterceptors(mid)
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
      await appTest.buildAndStart();

      const response = await appTest
        .supertest()
        .get('/')
        .expect(200);
      expect(response).toMatchSnapshot();
      expect(result).toMatchSnapshot();
    });

    test('with errors', async () => {
      const mid: e.RequestHandler = (req, res) => {
        result += 'midError';
        throw new Error('Error');
      };

      @UseExpressInterceptors(mid)
      @Controller({
        path: '/',
      })
      class TestController {
        @Get('/')
        public getTest() {
          return 'GET';
        }
      }

      const spyCtl = sinon.spy(TestController.prototype, 'getTest');

      appTest.addClass(TestController);
      await appTest.buildAndStart();

      await appTest
        .supertest()
        .get('/')
        .expect(500);
      expect(result).toMatchSnapshot();
      expect(spyCtl.notCalled).toBeTruthy();
    });
  });
});

describe('error next', () => {
  test('error next called multiple time', async () => {
    @Service()
    class A implements Interceptor {
      async intercept(@Next() next: nextFn) {
        await next();
        await next();
      }
    }
    @Controller('/')
    class TestController {
      @UseInterceptors(A)
      @Get(':id')
      public getTest2(@RequestParam('id') id: number) {
        return id;
      }
    }
    appTest.addClass(TestController);
    await appTest.buildAndStart();
    await appTest
      .supertest()
      .get('/0')
      .expect(500);
  });
});

describe('ExpressConverter errors', () => {
  test('Bad interceptor', async () => {
    @Service()
    class A {
      async interceptLOL() {
        console.log('bad interceptor');
      }
    }

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
      serverConfig(app: e.Application, container: Container) {
        const converter = container.get(ExpressConverter);
        app.use(converter.interceptorToMiddleware(A));
      }
    }

    appTest.addClass(TestController);
    appTest.addClass(ServerConfig);
    await expect(appTest.buildAndStart()).rejects.toMatchSnapshot();
  });

  test('Interceptor throw exception', async () => {
    @Service()
    class A implements Interceptor {
      async intercept() {
        throw new Error();
      }
    }

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
      serverConfig(app: e.Application, container: Container) {
        const converter = container.get(ExpressConverter);
        app.use(converter.interceptorToMiddleware(A));
      }
    }

    const spyA = sinon.spy(A.prototype, 'intercept');
    const spyCtl = sinon.spy(TestController.prototype, 'getTest');

    appTest.addClass(TestController);
    appTest.addClass(ServerConfig);
    await appTest.buildAndStart();
    await appTest.supertest().get('/');
    expect(spyA.calledOnce).toMatchSnapshot();
    expect(spyCtl.notCalled).toMatchSnapshot();
  });

  test('Interceptor intercept error before SendErrorInterceptor', async () => {
    @Service()
    class A implements Interceptor {
      async intercept(@Next() next: nextFn, @Response() res: GabResponse) {
        try {
          await next();
        } catch {
          res.body = 'Error interceptor';
        }
      }
    }

    @Controller('/')
    class TestController {
      @Get('/')
      public getTest() {
        throw new Error();
      }
    }

    const spyA = sinon.spy(A.prototype, 'intercept');
    const spyCtl = sinon.spy(TestController.prototype, 'getTest');

    appTest.addClass(TestController);
    await appTest.build();

    appTest.gab.container.get(WebConfiguration).globalInterceptors.push(A);
    await appTest.start();

    const response = await appTest
      .supertest()
      .get('/')
      .expect(200);
    // const response = await appTest.supertest().get('/').expect(200);
    expect(response).toMatchSnapshot();
    expect(spyA.calledOnce).toMatchSnapshot();
    expect(spyCtl.notCalled).toMatchSnapshot();
  });
});
