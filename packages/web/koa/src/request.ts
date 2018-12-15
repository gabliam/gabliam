import { GabRequest } from '@gabliam/web-core';
import { merge } from 'lodash';
import { alias } from 'property-tunnel';
import { koa } from './koa';

export class KoaRequest implements GabRequest<koa.Request> {
  /**
   * Return the original request
   */
  get originalRequest() {
    return this.request;
  }

  @alias(['request', 'body'])
  // body
  body: object;

  /**
   * Request headers
   */
  @alias(['request', 'headers'])
  headers: any;

  /**
   * Check if the request is fresh, aka
   * Last-Modified and/or the ETag
   * still match.
   */
  @alias(['request', 'fresh'], { access: 'readonly' })
  readonly fresh: boolean;

  /**
   * Parse the "Host" header field hostname
   * and support X-Forwarded-Host when a
   * proxy is enabled.
   */
  @alias(['request', 'hostname'], { access: 'readonly' })
  readonly hostname: string;

  /**
   * Request remote address. Supports X-Forwarded-For when app.proxy is true.
   */
  @alias(['request', 'ip'], { access: 'readonly' })
  readonly ip: string;

  /**
   * When `app.proxy` is `true`, parse
   * the "X-Forwarded-For" ip address list.
   *
   * For example if the value were "client, proxy1, proxy2"
   * you would receive the array `["client", "proxy1", "proxy2"]`
   * where "proxy2" is the furthest down-stream.
   */
  @alias(['request', 'ips'], { access: 'readonly' })
  readonly ips: string[];

  @alias(['request', 'file'], { access: 'readonly' })
  readonly file: any;

  @alias(['request', 'files'], { access: 'readonly' })
  readonly files: any;

  /**
   * Get/Set request method.
   */
  @alias(['request', 'method'])
  method: string;

  /**
   * Get original url
   */
  @alias(['request', 'originalUrl'], { access: 'readonly' })
  readonly originalUrl: string;

  /**
   * Get/Set request URL.
   */
  @alias(['request', 'url'])
  url: string;

  /**
   * Get/Set request param
   */
  @alias(['context', 'params'])
  params: any;

  /**
   * Get request pathname.
   * Set pathname, retaining the query-string when present.
   */
  @alias(['request', 'path'])
  path: string;

  /**
   * Return the protocol string "http" or "https"
   * when requested with TLS. When the proxy setting
   * is enabled the "X-Forwarded-Proto" header
   * field will be trusted. If you're running behind
   * a reverse proxy that supplies https for you this
   * may be enabled.
   */
  @alias(['request', 'protocol'], { access: 'readonly' })
  readonly protocol: string;

  @alias(['request', 'querystring'])
  querystring: string;

  // route;

  /**
   * Short-hand for:
   *
   *    this.protocol == 'https'
   */
  @alias(['request', 'secure'], { access: 'readonly' })
  readonly secure: boolean;

  /**
   * Check if the request is stale, aka
   * "Last-Modified" and / or the "ETag" for the
   * resource has changed.
   */
  @alias(['request', 'stale'], { access: 'readonly' })
  readonly stale: boolean;

  /**
   * Return subdomains as an array.
   *
   * Subdomains are the dot-separated parts of the host before the main domain
   * of the app. By default, the domain of the app is assumed to be the last two
   * parts of the host. This can be changed by setting `app.subdomainOffset`.
   *
   * For example, if the domain is "tobi.ferrets.example.com":
   * If `app.subdomainOffset` is not set, this.subdomains is
   * `["ferrets", "tobi"]`.
   * If `app.subdomainOffset` is 3, this.subdomains is `["tobi"]`.
   */
  @alias(['request', 'subdomains'], { access: 'readonly' })
  readonly subdomains: string[];

  /**
   * Add private query.
   * In koa, when you set value to query, koa update querystring with qs.stringify.
   * When validate interceptor is used, if you set Joi.number, validate cast query to number.
   *
   * @see {@link https://github.com/koajs/koa/blob/master/lib/request.js#L186}
   */
  private _query: any = {};

  // @ts-ignore : context use with property-tunnel
  constructor(private context: koa.Context, private request: koa.Request) {}

  /**
   * Get parsed query-string.
   * Set query-string as an object.
   */
  set query(query: any) {
    this._query = query;
    this.request.query = query;
  }

  get query() {
    return merge({}, this.request.query, this._query);
  }

  /**
   * Check if the request was an _XMLHttpRequest_.
   */
  get xhr() {
    return this.request.get('X-Requested-With') === 'XMLHttpRequest';
  }

  /**
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `undefined`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single mime type string
   * such as "application/json", the extension name
   * such as "json", a comma-delimted list such as "json, html, text/plain",
   * or an array `["json", "html", "text/plain"]`. When a list
   * or array is given the _best_ match, if any is returned.
   *
   * Examples:
   *
   *     // Accept: text/html
   *     req.accepts('html');
   *     // => "html"
   *
   *     // Accept: text/*, application/json
   *     req.accepts('html');
   *     // => "html"
   *     req.accepts('text/html');
   *     // => "text/html"
   *     req.accepts('json, text');
   *     // => "json"
   *     req.accepts('application/json');
   *     // => "application/json"
   *
   *     // Accept: text/*, application/json
   *     req.accepts('image/png');
   *     req.accepts('png');
   *     // => undefined
   *
   *     // Accept: text/*;q=.5, application/json
   *     req.accepts(['html', 'json']);
   *     req.accepts('html, json');
   *     // => "json"
   */
  accepts(...type: string[]): string[] | string | false {
    if (type.length) {
      return <string[] | string | false>this.request.accepts(...type);
    }
    return <string[] | string | false>this.request.accepts();
  }

  /**
   * Return accepted charsets or best fit based on `charsets`.
   *
   * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
   * an array sorted by quality is returned:
   *
   *     ['utf-8', 'utf-7', 'iso-8859-1']
   */
  acceptsCharsets(...charsets: string[]): string[] | string | boolean {
    if (charsets.length) {
      return this.request.acceptsCharsets(...charsets);
    }
    return this.request.acceptsCharsets();
  }

  /**
   * Return accepted encodings or best fit based on `encodings`.
   *
   * Given `Accept-Encoding: gzip, deflate`
   * an array sorted by quality is returned:
   *
   *     ['gzip', 'deflate']
   */
  acceptsEncodings(...encodings: string[]): string[] | string | boolean {
    if (encodings.length) {
      return this.request.acceptsEncodings(...encodings);
    }
    return this.request.acceptsEncodings();
  }

  /**
   * Return accepted languages or best fit based on `langs`.
   *
   * Given `Accept-Language: en;q=0.8, es, pt`
   * an array sorted by quality is returned:
   *
   *     ['es', 'pt', 'en']
   */
  acceptsLanguages(...langs: string[]): string[] | string | boolean {
    if (langs.length) {
      return this.request.acceptsLanguages(...langs);
    }
    return this.request.acceptsLanguages();
  }

  /**
   * Return request header.
   *
   * The `Referrer` header field is special-cased,
   * both `Referrer` and `Referer` are interchangeable.
   *
   * Examples:
   *
   *     this.get('Content-Type');
   *     // => "text/plain"
   *
   *     this.get('content-type');
   *     // => "text/plain"
   *
   *     this.get('Something');
   *     // => undefined
   */
  get(field: string): string | undefined {
    return this.request.get(field);
  }

  /**
   * Check if the incoming request contains the "Content-Type"
   * header field, and it contains the give mime `type`.
   *
   * Examples:
   *
   *      // With Content-Type: text/html; charset=utf-8
   *      req.is('html');
   *      req.is('text/html');
   *      req.is('text/*');
   *      // => true
   *
   *      // When Content-Type is application/json
   *      req.is('json');
   *      req.is('application/json');
   *      req.is('application/*');
   *      // => true
   *
   *      req.is('html');
   *       // => false
   */
  is(type: string): string | false {
    return <string | false>this.request.is(type);
  }
}
