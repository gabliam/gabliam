import HttpStatus from 'http-status-codes';
import statuses from 'statuses';
import { HttpException } from './http-exception';

export class BadGatewayException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.BAD_GATEWAY],
    otherFields = {}
  ) {
    super(message, HttpStatus.BAD_GATEWAY, error, otherFields);
  }
}
