import * as statuses from 'statuses';
import { isObject } from '@gabliam/core';

/**
 * Exception web error
 */
export class HttpException extends Error {
  public readonly message: any;

  constructor(
    private readonly response: string | object,
    private readonly statusCode: number,
    private readonly error?: string,
    private readonly otherFields = {}
  ) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HttpException.prototype);

    // tslint:disable-next-line:max-line-length
    this.message = response;
  }

  public getJson(): string | object {
    return {
      statusCode: this.statusCode,
      error: this.error || statuses[this.statusCode],
      ...(<object>(
        (isObject(this.response) ? this.response : { message: this.response })
      )),
      ...this.otherFields,
    };
  }

  public getStatus(): number {
    return this.statusCode;
  }
}
