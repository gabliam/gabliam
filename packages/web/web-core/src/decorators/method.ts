import { METADATA_KEY } from '../constants';
import { makePropDecorator } from '@gabliam/core/src';

export type defaultMethods =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'head'
  | 'delete';

/**
 * Controller method metadata.
 */
export interface ControllerMethod {
  /**
   * path of the method
   */
  path: string;

  /**
   * method use for express router
   * get, all, put ...
   */
  method: string;
}

const makeWebMethodDecorator = (method: string) => {
  return makePropDecorator(
    METADATA_KEY.controllerMethod,
    (path: string): ControllerMethod => ({ path, method })
  );
};

/**
 * Type of the `All` decorator / constructor function.
 */
export interface AllDecorator {
  /**
   * Decorator for mapping web requests onto methods
   * in request-handling classes with flexible method signatures.
   *
   * This decorator is like the standard methods, except it matches all HTTP verbs
   *
   * @usageNotes
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @All('/')
   *    hello() {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path: string): MethodDecorator;

  /**
   * see the `@All` decorator.
   */
  new (path: string): any;
}

export const All: AllDecorator = makeWebMethodDecorator('all');

/**
 * Type of the `Get` decorator / constructor function.
 */
export interface GetDecorator {
  /**
   * Decorator for mapping web requests onto methods
   * in request-handling classes with flexible method signatures.
   *
   * Routes HTTP GET requests to the specified path.
   *
   * @usageNotes
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Get('/')
   *    hello() {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path: string): MethodDecorator;

  /**
   * see the `@Get` decorator.
   */
  new (path: string): any;
}

export const Get: GetDecorator = makeWebMethodDecorator('get');

/**
 * Type of the `Post` decorator / constructor function.
 */
export interface PostDecorator {
  /**
   * Decorator for mapping web requests onto methods
   * in request-handling classes with flexible method signatures.
   *
   * Routes HTTP Post requests to the specified path.
   *
   * @usageNotes
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Post('/')
   *    hello() {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path: string): MethodDecorator;

  /**
   * see the `@Post` decorator.
   */
  new (path: string): any;
}

export const Post: PostDecorator = makeWebMethodDecorator('post');

/**
 * Type of the `Put` decorator / constructor function.
 */
export interface PutDecorator {
  /**
   * Decorator for mapping web requests onto methods
   * in request-handling classes with flexible method signatures.
   *
   * Routes HTTP Put requests to the specified path.
   *
   * @usageNotes
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Put('/')
   *    hello() {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path: string): MethodDecorator;

  /**
   * see the `@Put` decorator.
   */
  new (path: string): any;
}

export const Put: PutDecorator = makeWebMethodDecorator('put');

/**
 * Type of the `Patch` decorator / constructor function.
 */
export interface PatchDecorator {
  /**
   * Decorator for mapping web requests onto methods
   * in request-handling classes with flexible method signatures.
   *
   * Routes HTTP Patch requests to the specified path.
   *
   * @usageNotes
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Patch('/')
   *    hello() {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path: string): MethodDecorator;

  /**
   * see the `@Patch` decorator.
   */
  new (path: string): any;
}

export const Patch: PatchDecorator = makeWebMethodDecorator('patch');

/**
 * Type of the `Head` decorator / constructor function.
 */
export interface HeadDecorator {
  /**
   * Decorator for mapping web requests onto methods
   * in request-handling classes with flexible method signatures.
   *
   * Routes HTTP Head requests to the specified path.
   *
   * @usageNotes
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Head('/')
   *    hello() {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path: string): MethodDecorator;

  /**
   * see the `@Head` decorator.
   */
  new (path: string): any;
}

export const Head: HeadDecorator = makeWebMethodDecorator('head');

/**
 * Type of the `Delete` decorator / constructor function.
 */
export interface DeleteDecorator {
  /**
   * Decorator for mapping web requests onto methods
   * in request-handling classes with flexible method signatures.
   *
   * Routes HTTP Delete requests to the specified path.
   *
   * @usageNotes
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @Delete('/')
   *    hello() {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (path: string): MethodDecorator;

  /**
   * see the `@Delete` decorator.
   */
  new (path: string): any;
}

export const Delete: DeleteDecorator = makeWebMethodDecorator('delete');

/**
 * Type of the `CustomMethod` decorator / constructor function.
 */
export interface CustomMethodDecorator {
  /**
   * Decorator for mapping web requests onto methods
   * in request-handling classes with flexible method signatures.
   *
   * Routes HTTP custom method requests to the specified path.
   *
   * @usageNotes
   *
   * ```typescript
   * @Controller('/')
   * class SampleController {
   *    @CustomMethod('/')
   *    hello() {
   *      return 'Hello';
   *    }
   * }
   * ```
   */
  (method: string, path: string): MethodDecorator;

  /**
   * see the `@Method` decorator.
   */
  new (method: string, path: string): any;
}

export const CustomMethod: CustomMethodDecorator = makePropDecorator(
  METADATA_KEY.controllerMethod,
  (method: string, path: string): ControllerMethod => ({ path, method })
);
