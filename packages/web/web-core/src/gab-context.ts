import { alias } from 'property-tunnel';
import { Cookie } from './cookies';
import { GabRequest } from './gab-request';
import { GabResponse } from './gab-response';

export class GabContext<T = any, U = any> {
  /**
   * Return request header.
   */
  @alias(['request', 'headers'])
  headers: any;

  /**
   * Get/Set request URL.
   */
  @alias(['request', 'url'])
  url: string;

  /**
   * Get/Set request method.
   */
  @alias(['request', 'method'])
  method: string;

  /**
   * Get request pathname.
   * Set pathname, retaining the query-string when present.
   */
  @alias(['request', 'path'])
  path: string;

  /**
   * Get parsed query-string.
   * Set query-string as an object.
   */
  @alias(['request', 'query'])
  query: any;

  /**
   * Get/Set query string.
   */
  @alias(['request', 'querystring'])
  querystring: string;

  /**
   * Parse the "Host" header field hostname
   * and support X-Forwarded-Host when a
   * proxy is enabled.
   */
  @alias(['request', 'hostname'])
  hostname: string;

  /**
   * Check if the request is fresh, aka
   * Last-Modified and/or the ETag
   * still match.
   */
  @alias(['request', 'fresh'], { access: 'readonly' })
  readonly fresh: boolean;

  /**
   * Check if the request is stale, aka
   * "Last-Modified" and / or the "ETag" for the
   * resource has changed.
   */
  @alias(['request', 'stale'], { access: 'readonly' })
  readonly stale: boolean;

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

  /**
   * Short-hand for:
   *
   *    this.protocol == 'https'
   */
  @alias(['request', 'secure'], { access: 'readonly' })
  readonly secure: boolean;

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
  @alias(['request', 'ips'], { access: 'readonly' })
  readonly subdomains: string[];

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
  @alias(['request', 'accepts'])
  accepts: (...types: string[]) => string[] | string | false;

  /**
   * Return accepted charsets or best fit based on `charsets`.
   *
   * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
   * an array sorted by quality is returned:
   *
   *     ['utf-8', 'utf-7', 'iso-8859-1']
   */
  @alias(['request', 'acceptsCharsets'])
  acceptsCharsets: (...charsets: string[]) => string[] | string | false;

  /**
   * Return accepted encodings or best fit based on `encodings`.
   *
   * Given `Accept-Encoding: gzip, deflate`
   * an array sorted by quality is returned:
   *
   *     ['gzip', 'deflate']
   */
  @alias(['request', 'acceptsEncodings'])
  acceptsEncodings: (...encodings: string[]) => string[] | string | false;

  /**
   * Return accepted languages or best fit based on `langs`.
   *
   * Given `Accept-Language: en;q=0.8, es, pt`
   * an array sorted by quality is returned:
   *
   *     ['es', 'pt', 'en']
   */
  @alias(['request', 'acceptsLanguages'])
  acceptsLanguages: (...langs: string[]) => string[] | string | false;

  /**
   * Check if the incoming request contains the "Content-Type"
   * header field, and it contains any of the give mime `type`s.
   * If there is no request body, `null` is returned.
   * If there is no content type, `false` is returned.
   * Otherwise, it returns the first `type` that matches.
   *
   * Examples:
   *
   *     // With Content-Type: text/html; charset=utf-8
   *     this.is('html'); // => 'html'
   *     this.is('text/html'); // => 'text/html'
   *     this.is('text/*', 'application/json'); // => 'text/html'
   *
   *     // When Content-Type is application/json
   *     this.is('json', 'urlencoded'); // => 'json'
   *     this.is('application/json'); // => 'application/json'
   *     this.is('html', 'application/*'); // => 'application/json'
   *
   *     this.is('html'); // => false
   */
  @alias(['request', 'is'])
  is: (...types: string[]) => string | false;

  /**
   * Get/Set response status code.
   */
  @alias(['response', 'status'])
  status: number;

  /**
   * Get/Set response status message
   */
  @alias(['response', 'message'])
  message: string;

  /**
   * Get/Set response body.
   */
  @alias(['response', 'body'])
  body: any;

  /**
   * Check if a header has been written to the socket.
   */
  @alias(['response', 'headersSent'], { access: 'readonly' })
  readonly headersSent: boolean;

  /**
   * Vary on `field`.
   */
  @alias(['response', 'vary'])
  vary: (field: string) => void;

  /**
   * Redirect to the given `url` with optional response `status`
   * defaulting to 302.
   *
   * The resulting `url` is determined by `res.location()`, so
   * it will play nicely with mounted apps, relative paths,
   * `"back"` etc.
   *
   * Examples:
   *
   *    res.redirect('/foo/bar');
   *    res.redirect('http://example.com');
   *    res.redirect('http://example.com', 301);
   *    res.redirect('../login'); // /blog/post/1 -> /blog/login
   */
  @alias(['response', 'redirect'])
  redirect: (url: string, status?: number) => void;

  /**
   * Set Content-Disposition header to "attachment" with optional `filename`.
   */
  @alias(['response', 'attachment'])
  attachment: (filename: string) => void;

  /**
   * Return the response mime type void of
   * parameters such as "charset".
   *
   * Set Content-Type response header with `type` through `mime.lookup()`
   * when it does not contain a charset.
   *
   * Examples:
   *
   *     this.type = '.html';
   *     this.type = 'html';
   *     this.type = 'json';
   *     this.type = 'application/json';
   *     this.type = 'png';
   */
  @alias(['response', 'type'])
  type: string;

  /**
   * Set header `field` to `val`, or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    this.set('Foo', ['bar', 'baz']);
   *    this.set('Accept', 'application/json');
   *    this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   */
  @alias(['response', 'set'])
  set: (
    field: { [key: string]: string } | string,
    val?: string | string[]
  ) => void;

  /**
   * Append additional header `field` with value `val`.
   *
   * Examples:
   *
   * ```
   * this.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
   * this.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
   * this.append('Warning', '199 Miscellaneous warning');
   * ```
   */
  @alias(['response', 'append'])
  append: (field: string, val: string | string[]) => void;

  state: { [k: string]: any } = {};

  constructor(
    public request: GabRequest<T>,
    public response: GabResponse<U>,
    public cookies: Cookie
  ) {}
}
