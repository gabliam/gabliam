import { Service } from '@gabliam/core';
import escapeHtml from 'escape-html';
import statuses from 'statuses';
import { HttpException } from '../exceptions';
import { ExecutionContext } from '../execution-context';
import { GabResponse } from '../gab-response';
import { nextFn } from '../interface';
import { ExecContext, Next, Response } from '../metadatas';
import { ResponseEntity } from '../response-entity';
import { Interceptor } from './utils';

@Service()
export class SendErrorInterceptor implements Interceptor {
  async intercept(
    @Next() next: nextFn,
    @ExecContext() exec: ExecutionContext,
    @Response() res: GabResponse
  ) {
    const env = process.env.NODE_ENV || 'development';
    try {
      await next();
    } catch (err) {
      if (exec.getMethodInfo().json) {
        if (err instanceof HttpException) {
          return new ResponseEntity(err.getJson(), err.getStatus());
        }
        // respect status code from error
        const status = getErrorStatusCode(err) || getResponseStatusCode(res);

        // get error message
        const msg = getErrorMessage(err, status, env, true);

        return createResponse({ status, error: msg }, status);
      }

      if (err instanceof HttpException) {
        const status = err.getStatus();
        const msg = getErrorMessage(err, status, env, false);
        const body = createHtmlDocument(msg);

        return createResponse(body, status);
      }

      // let default error handler of express js
      throw err;
    }
  }
}

const DOUBLE_SPACE_REGEXP = /\x20{2}/g;
const NEWLINE_REGEXP = /\n/g;

function getResponseStatusCode(res: GabResponse) {
  let status = res.status;

  // default status code to 500 if outside valid range
  if (typeof status !== 'number' || status < 400 || status > 599) {
    status = 500;
  }

  return status;
}

function getErrorStatusCode(err: any): number | undefined {
  // check err.status
  if (typeof err.status === 'number' && err.status >= 400 && err.status < 600) {
    return err.status;
  }

  // check err.statusCode
  if (
    typeof err.statusCode === 'number' &&
    err.statusCode >= 400 &&
    err.statusCode < 600
  ) {
    return err.statusCode;
  }

  if (err !== undefined) {
    return 500;
  }

  return undefined;
}

function createResponse(body: string | object, status: number) {
  const res = new ResponseEntity(body, status);
  res.addHeader('Content-Security-Policy', `default-src 'none'`);
  res.addHeader('X-Content-Type-Options', 'nosniff');
  return res;
}

function getErrorMessage(err: any, status: number, env: string, json: boolean) {
  if (status === 204) {
    return '';
  }

  let msg: string | undefined;

  if (env !== 'production') {
    // use err.stack, which typically includes err.message
    msg = err.stack;

    if (!msg) {
      if (json) {
        msg = err;
      } else if (typeof err.toString === 'function') {
        msg = err.toString();
      }
    }
  }

  return msg || statuses.message[status] || '';
}

function createHtmlDocument(message: string) {
  const body = escapeHtml(message)
    .replace(NEWLINE_REGEXP, '<br>')
    .replace(DOUBLE_SPACE_REGEXP, ' &nbsp;');

  return (
    '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '<meta charset="utf-8">\n' +
    '<title>Error</title>\n' +
    '</head>\n' +
    '<body>\n' +
    '<pre>' +
    body +
    '</pre>\n' +
    '</body>\n' +
    '</html>\n'
  );
}
