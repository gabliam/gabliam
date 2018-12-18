import {
  ExecutionContext,
  GabContext,
  ResponseEntity,
  convertValueFn,
} from '@gabliam/web-core';
import { koaRouter } from './koa';

export const createConverterValue = (
  context: koaRouter.IRouterContext
): convertValueFn => {
  return (ctx: GabContext, execCtx: ExecutionContext, result: any) => {
    const methodInfo = execCtx.getMethodInfo();
    const sendJsonValue = (value: any = '') => {
      let val: any;
      try {
        val = JSON.stringify(value);
      } catch {
        /* istanbul ignore next */
        val = value;
      }
      context.type = 'application/json';
      context.body = val;
    };
    // response handler if the result is a ResponseEntity
    function responseEntityHandler(value: ResponseEntity) {
      if (value.hasHeader()) {
        Object.keys(value.headers).forEach(k =>
          context.set(k, '' + value.headers[k])
        );
      }
      context.status = value.status;
      sendJsonValue(value.body);
    }
    if (!context.headerSent) {
      if (result !== undefined) {
        if (result instanceof ResponseEntity) {
          responseEntityHandler(result);
        } else if (methodInfo.json) {
          sendJsonValue(result);
        } else {
          context.body = result;
        }
      } else if (ctx.body !== undefined) {
        const { status, message, body, type } = ctx;
        if (type) {
          context.response.type = type;
        }
        if (message) {
          context.response.message = message;
        }
        if (status) {
          context.response.status = status;
        }
        if (methodInfo.json) {
          sendJsonValue(body);
        } else {
          context.body = body;
        }
      }
    }
  };
};
