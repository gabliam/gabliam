import * as HttpStatus from 'http-status-codes';
import * as statuses from 'statuses';
import { HttpException } from './http-exception';

export class GoneException extends HttpException {
  constructor(
    message?: string | object | any,
    error = statuses[HttpStatus.GONE],
    otherFields = {}
  ) {
    super(message, HttpStatus.GONE, error, otherFields);
  }
}
