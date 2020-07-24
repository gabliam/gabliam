import * as HttpStatus from 'http-status-codes';
import * as statuses from 'statuses';
import { HttpException } from './http-exception';

export class GatewayTimeoutException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses.message[HttpStatus.GATEWAY_TIMEOUT],
    otherFields = {}
  ) {
    super(message, HttpStatus.GATEWAY_TIMEOUT, error, otherFields);
  }
}
