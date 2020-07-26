import HttpStatus from 'http-status-codes';
import statuses from 'statuses';
import { HttpException } from './http-exception';

export class NotFoundException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.NOT_FOUND],
    otherFields = {}
  ) {
    super(message, HttpStatus.NOT_FOUND, error, otherFields);
  }
}
