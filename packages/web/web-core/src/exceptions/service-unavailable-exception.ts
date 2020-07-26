import HttpStatus from 'http-status-codes';
import statuses from 'statuses';
import { HttpException } from './http-exception';

export class ServiceUnavailableException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.SERVICE_UNAVAILABLE],
    otherFields = {}
  ) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, error, otherFields);
  }
}
