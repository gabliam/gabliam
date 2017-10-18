import * as http from 'http';

export interface SampleError {
  statusCode: number;
  error?: string;
  message: any;
  code?: number;
}

export function createError(
  error: string | Error,
  statusCode: number = 500
): SampleError {
  let message: any;
  let code: number | undefined = undefined;

  if (error instanceof Error) {
    if (error.name === 'MongoError') {
      statusCode = 400;
      code = (error as any).code;
      message = (error as any).errmsg;
    } else {
      statusCode = 400;
      message = (error as any).message;
    }
  } else {
    message = error;
  }

  if (message.inner) {
    delete message.inner;
  }

  const err: SampleError = {
    statusCode,
    error: http.STATUS_CODES[statusCode],
    message
  };

  if (code) {
    err['code'] = code;
  }

  return err;
}
