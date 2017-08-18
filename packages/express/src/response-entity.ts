import { OutgoingHttpHeaders } from 'http';
import * as HttpStatus from 'http-status-codes';

export class ResponseEntity<T = any> {
  private _status = HttpStatus.OK;

  private _headers: OutgoingHttpHeaders = {};

  private _body: T | null = null;

  constructor(body: T, status: number = 200) {
    this._body = body;
    this._status = status;
  }

  get status() {
    return this._status;
  }

  get headers() {
    return this._headers;
  }

  get body() {
    return this._body;
  }

  hasHeader() {
    return Object.keys(this._headers).length !== 0;
  }

  addHeader(headerName: string, value: any) {
    this._headers[headerName] = value;
  }
}

/**
 * A shortcut for creating a ResponseEntity with the given body and the status set to OK.
 * @param body
 */
export function ok<T = any>(body?: T) {
  return new ResponseEntity(body, HttpStatus.OK);
}

/**
 * Create a ResponseEntity with an ACCEPTED status.
 */
export function accepted() {
  return new ResponseEntity(null, HttpStatus.ACCEPTED);
}

/**
 * Create a ResponseEntity with a BAD_REQUEST status.
 */
export function badRequest() {
  return new ResponseEntity(null, HttpStatus.BAD_REQUEST);
}

/**
 * Create a ResponseEntity with a NO_CONTENT status.
 */
export function noContent() {
  return new ResponseEntity(null, HttpStatus.NO_CONTENT);
}

/**
 * Create a ResponseEntity with a NOT_FOUND status.
 */
export function notFound() {
  return new ResponseEntity(null, HttpStatus.NOT_FOUND);
}
