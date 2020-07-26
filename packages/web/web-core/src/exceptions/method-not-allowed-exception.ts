import HttpStatus from 'http-status-codes';
import statuses from 'statuses';
import { HttpException } from './http-exception';

export class MethodNotAllowedException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.METHOD_NOT_ALLOWED],
    otherFields = {}
  ) {
    super(message, HttpStatus.METHOD_NOT_ALLOWED, error, otherFields);
  }
}
