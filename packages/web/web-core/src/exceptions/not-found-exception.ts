import * as HttpStatus from 'http-status-codes';
import * as statuses from 'statuses';
import { HttpException } from './http-exception';

export class NotFoundException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses[HttpStatus.NOT_FOUND],
    otherFields = {}
  ) {
    super(message, HttpStatus.NOT_FOUND, error, otherFields);
  }
}
