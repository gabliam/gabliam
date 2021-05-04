import {
  ExecutionContext,
  GabContext,
  ResponseEntity,
  convertValueFn,
} from '@gabliam/web-core';
import { express } from './express';

export const converterValue: convertValueFn = (
  ctx: GabContext,
  execCtx: ExecutionContext,
  result: any,
) => {
  // response handler if the result is a ResponseEntity
  function convertEntity(value: ResponseEntity) {
    if (value.hasHeader()) {
      ctx.response.set(<any>value.headers);
    }
    ctx.status = value.status;
    ctx.body = value.body;
  }

  if (!ctx.headersSent) {
    if (result !== undefined) {
      if (result instanceof ResponseEntity) {
        convertEntity(result);
      } else if (typeof result === 'string' || typeof result === 'object') {
        ctx.body = result;
      } else {
        ctx.body = `${result}`;
      }
    }
  }
};

export const send = (ctx: GabContext, res: express.Response, json: boolean) => {
  const { status, message, body, type } = ctx;
  /* istanbul ignore next */
  if (type) {
    res.type(type);
  }
  /* istanbul ignore next */
  if (message) {
    res.statusMessage = message;
  }

  if (status) {
    res.status(status);
  }
  if (json) {
    res.json(body);
  } else {
    res.send(body);
  }
};
