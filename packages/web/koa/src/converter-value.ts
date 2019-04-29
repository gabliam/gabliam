import {
  convertValueFn,
  ExecutionContext,
  GabContext,
  ResponseEntity,
} from '@gabliam/web-core';

export const converterValue: convertValueFn = (
  ctx: GabContext,
  execCtx: ExecutionContext,
  result: any
) => {
  const methodInfo = execCtx.getMethodInfo();
  const sendJsonValue = (value: any = '') => {
    let val: any;
    try {
      val = JSON.stringify(value);
    } catch {
      /* istanbul ignore next */
      val = value;
    }
    ctx.type = 'application/json';
    ctx.body = val;
  };
  // response handler if the result is a ResponseEntity
  function responseEntityHandler(value: ResponseEntity) {
    if (value.hasHeader()) {
      Object.keys(value.headers).forEach(k =>
        ctx.set(k, '' + value.headers[k])
      );
    }

    if (methodInfo.json) {
      sendJsonValue(value.body);
    } else {
      ctx.body = value.body;
    }
    ctx.status = value.status;
  }
  if (!ctx.headersSent) {
    if (result !== undefined) {
      if (result instanceof ResponseEntity) {
        responseEntityHandler(result);
      } else if (methodInfo.json) {
        sendJsonValue(result);
      } else {
        ctx.body = result;
      }

      if (methodInfo.json) {
        ctx.type = 'application/json';
      }
    }
  }
};
