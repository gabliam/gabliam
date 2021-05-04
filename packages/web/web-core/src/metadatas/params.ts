import { makeParamDecorator, Type } from '@gabliam/core';
import { get } from 'lodash';
import { METADATA_KEY, PARAMETER_TYPE } from '../constants';
import { ExecutionContext } from '../execution-context';
import { GabContext } from '../gab-context';

/**
 * Represent the handler for extract the parameter
 *
 * args : Arguments passed to decorator
 * ctx: GabContext
 * type: type of parameters (ex @Query('nb) nb: number, type = Number)
 * execCtx: ExecutionContext
 * next: next function
 */
export type HandlerFn = <V>(
  args: any,
  ctx: GabContext,
  type: Type<any> | undefined,
  execCtx: ExecutionContext | null | undefined,
  next: V,
) => any;

export interface WebParamDecorator<T = any> {
  /**
   * Hander for extract the param
   */
  handler: HandlerFn;

  /**
   * Arguments passed to decorator
   */
  args: T[];

  /**
   * Type of decorator for introspection of parameters (swagger by ex)
   */
  type: string;
}

/**
 * Function for create you own param decorator
 * @usageNotes
 *
 * You must passed a type and the handler
 * Type is mandatory, this param is used for introspection of parameters (swagger by ex)
 *
 * Sample to extract the user in query
 *
 * ```typescript
 *  const User = makeWebParamDecorator('user', (args, ctx) => ctx.request.user)
 *
 * @Controller('/')
 * class SampleController {
 *    @Get('/')
 *    hello(@User() user: UserModel) {
 *      return 'Hello';
 *    }
 * }
 * ```
 */
export const makeWebParamDecorator = (type: string, handler: HandlerFn) =>
  makeParamDecorator(
    METADATA_KEY.controllerParameter,
    (...args: any[]): WebParamDecorator => ({ args, handler, type }),
  );

/**
 * Type of the `ExecContext` decorator / constructor function.
 */
export interface ExecContextDecorator {
  /**
   * Decorator that marks a parameter to inject ExecContext
   *
   * @usageNotes
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/')
   *    hello(@ExecContext() execCtx: ExecContext) {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (): ParameterDecorator;

  /**
   * see the `@ExecContext` decorator.
   */
  new (): any;
}

export const ExecContext: ExecContextDecorator = makeWebParamDecorator(
  PARAMETER_TYPE.EXEC_CONTEXT,
  (_, __, ___, execCtx) => execCtx,
);

/**
 * Type of the `Context` decorator / constructor function.
 */
export interface ContextDecorator {
  /**
   * Decorator that marks a parameter to inject Context
   *
   * @usageNotes
   * You can supply an optional path to extract a part of Context.
   * Under the hood, use lodash.get
   *
   * Example with full Context
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/')
   *    hello(@Context() ctx: GabContext) {
   *      return 'Hello';
   *    }
   * }
   * ```
   *
   * Example with part of Context
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/')
   *    hello(@Context('protocol') protocol: string) {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@Context` decorator.
   */
  new (path?: string): any;
}

export const Context: ContextDecorator = makeWebParamDecorator(
  PARAMETER_TYPE.CONTEXT,
  ([path]: [string | undefined], ctx) => {
    if (path) {
      return get(ctx, path);
    }
    return ctx;
  },
);

/**
 * Type of the `Request` decorator / constructor function.
 */
export interface RequestDecorator {
  /**
   * Decorator that marks a parameter to inject Request
   *
   * @usageNotes
   * You can supply an optional path to extract a part of Request.
   * Under the hood, use lodash.get
   *
   * Example with full Request
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/')
   *    hello(@Request() request: GabRequest) {
   *      return 'Hello';
   *    }
   * }
   * ```
   *
   * Example with part of Request
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/')
   *    hello(@Request('fresh') fresh: boolean) {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@Request` decorator.
   */
  new (path?: string): any;
}

export const Request: RequestDecorator = makeWebParamDecorator(
  PARAMETER_TYPE.REQUEST,
  ([path]: [string | undefined], ctx) => {
    if (path) {
      return get(ctx.request, path);
    }
    return ctx.request;
  },
);

/**
 * Type of the `Response` decorator / constructor function.
 */
export interface ResponseDecorator {
  /**
   * Decorator that marks a parameter to inject Response
   *
   * @usageNotes
   * You can supply an optional path to extract a part of Response.
   * Under the hood, use lodash.get
   *
   * Example with full Response
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/')
   *    hello(@Response() response: GabResponse) {
   *      return 'Hello';
   *    }
   * }
   * ```
   *
   * Example with part of Response
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/')
   *    hello(@Response('headersSent') headersSent: boolean) {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@Response` decorator.
   */
  new (path?: string): any;
}

export const Response: ResponseDecorator = makeWebParamDecorator(
  PARAMETER_TYPE.RESPONSE,
  ([path]: [string | undefined], ctx) => {
    if (path) {
      return get(ctx.response, path);
    }
    return ctx.response;
  },
);

/**
 * Type of the `RequestParam` decorator / constructor function.
 */
export interface RequestParamDecorator {
  /**
   * Decorator that marks a parameter to inject RequestParam (context.request.params object)
   *
   * @usageNotes
   * You can supply an optional path to extract a part of RequestParam.
   * Under the hood, use lodash.get
   *
   * Example with full RequestParam
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/:id')
   *    get(@RequestParam() params: any) {
   *      return 'Hello';
   *    }
   * }
   * ```
   *
   * Example with part of RequestParam
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/:id')
   *    get(@RequestParam('id') id: string) {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@RequestParam` decorator.
   */
  new (path?: string): any;
}

export const RequestParam: RequestParamDecorator = makeWebParamDecorator(
  PARAMETER_TYPE.PARAMS,
  ([path]: [string | undefined], ctx, type) => {
    let res = ctx.request.params;
    if (path) {
      res = get(ctx.request.params, path);
    }

    if (res && type && type.name === 'Number') {
      try {
        // parseFloat for compatibility with integer and float
        res = Number.parseFloat(res);
        // eslint-disable-next-line no-empty
      } catch {}
    }

    return res;
  },
);

/**
 * Type of the `QueryParam` decorator / constructor function.
 */
export interface QueryParamDecorator {
  /**
   * Decorator that marks a parameter to inject QueryParam (context.request.query object)
   *
   * @usageNotes
   * You can supply an optional path to extract a part of QueryParam.
   * Under the hood, use lodash.get
   *
   * Example with full QueryParam
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/:id')
   *    get(@QueryParam() query: any) {
   *      return 'Hello';
   *    }
   * }
   * ```
   *
   * Example with part of QueryParam
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/:id')
   *    get(@QueryParam('test') test: string) {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@QueryParam` decorator.
   */
  new (path?: string): any;
}

export const QueryParam: QueryParamDecorator = makeWebParamDecorator(
  PARAMETER_TYPE.QUERY,
  ([path]: [string | undefined], ctx, type) => {
    let res = ctx.request.query;
    if (path) {
      res = get(ctx.request.query, path);
    }

    if (res && type && type.name === 'Number') {
      try {
        // parseFloat for compatibility with integer and float
        res = Number.parseFloat(res);
        // eslint-disable-next-line no-empty
      } catch {}
    }

    return res;
  },
);

/**
 * Type of the `RequestBody` decorator / constructor function.
 */
export interface RequestBodyDecorator {
  /**
   * Decorator that marks a parameter to inject RequestBody (context.request.body object)
   *
   * @usageNotes
   * You can supply an optional path to extract a part of RequestBody.
   * Under the hood, use lodash.get
   *
   * Example with full RequestBody
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/:id')
   *    get(@RequestBody() body: any) {
   *      return 'Hello';
   *    }
   * }
   * ```
   *
   * Example with part of RequestBody
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/:id')
   *    get(@RequestBody('test') test: string) {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@RequestBody` decorator.
   */
  new (path?: string): any;
}

export const RequestBody: RequestBodyDecorator = makeWebParamDecorator(
  PARAMETER_TYPE.BODY,
  ([path]: [string | undefined], ctx) => {
    if (path) {
      return get(ctx.request.body, path);
    }
    return ctx.request.body;
  },
);

/**
 * Type of the `RequestHeaders` decorator / constructor function.
 */
export interface RequestHeadersDecorator {
  /**
   * Decorator that marks a parameter to inject RequestHeaders (context.request.headers object)
   *
   * @usageNotes
   * You can supply an optional path to extract a part of RequestHeaders.
   * Under the hood, use lodash.get
   *
   * Example with full RequestHeaders
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/:id')
   *    get(@RequestHeaders() headers: any) {
   *      return 'Hello';
   *    }
   * }
   * ```
   *
   * Example with part of RequestHeaders
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/:id')
   *    get(@RequestHeaders('test') test: string) {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@RequestHeaders` decorator.
   */
  new (path?: string): any;
}

export const RequestHeaders: RequestHeadersDecorator = makeWebParamDecorator(
  PARAMETER_TYPE.HEADERS,
  ([path]: [string | undefined], ctx) => {
    if (path) {
      return get(ctx.request.headers, path);
    }
    return ctx.request.headers;
  },
);

/**
 * Type of the `Cookies` decorator / constructor function.
 */
export interface CookiesDecorator {
  /**
   * Decorator that marks a parameter to inject Cookies (context.request.headers object)
   *
   * @usageNotes
   * You can supply an optional path to extract a part of Cookies.
   * Under the hood, use lodash.get
   *
   * Example with full Cookies
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/:id')
   *    get(@Cookies() headers: any) {
   *      return 'Hello';
   *    }
   * }
   * ```
   *
   * Example with part of Cookies
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/:id')
   *    get(@Cookies('test') test: string) {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@Cookies` decorator.
   */
  new (path?: string): any;
}

export const Cookies: CookiesDecorator = makeWebParamDecorator(
  PARAMETER_TYPE.COOKIES,
  ([path]: [string | undefined], ctx) => {
    if (path) {
      return ctx.cookies.get(path);
    }
    return ctx.cookies;
  },
);

/**
 * Type of the `Next` decorator / constructor function.
 */
export interface NextDecorator {
  /**
   * Decorator that marks a parameter to inject Next function
   *
   * @usageNotes
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/')
   *    hello(@Next() next: any) {
   *      next();
   *    }
   * }
   * ```
   */
  (): ParameterDecorator;

  /**
   * see the `@Next` decorator.
   */
  new (): any;
}

export const Next: NextDecorator = makeWebParamDecorator(
  PARAMETER_TYPE.NEXT,
  (_, __, ___, ____, next) => next,
);
