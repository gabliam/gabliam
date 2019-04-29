import * as HttpStatus from 'http-status-codes';
import * as statuses from 'statuses';
import { HttpException } from './http-exception';

export class ServiceUnavailableException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses[HttpStatus.SERVICE_UNAVAILABLE],
    otherFields = {}
  ) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, error, otherFields);
  }
}
