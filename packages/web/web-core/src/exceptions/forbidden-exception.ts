import HttpStatus from 'http-status-codes';
import statuses from 'statuses';
import { HttpException } from './http-exception';

export class ForbiddenException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.FORBIDDEN],
    otherFields = {}
  ) {
    super(message, HttpStatus.FORBIDDEN, error, otherFields);
  }
}
