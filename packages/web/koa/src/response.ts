import { GabResponse } from '@gabliam/web-core';
import { koa } from './koa';
import * as send from 'koa-send';
import { alias } from 'property-tunnel';

export class KoaResponse implements GabResponse<koa.Response> {
  get originalResponse() {
    return this.response;
  }

  /**
   * Check if a header has been written to the socket.
   */
  @alias(['response', 'headersSent'], { access: 'readonly' })
  readonly headersSent: boolean;

  /**
   * Get/Set response status code.
   */
  status: number;

  /**
   * Get/Set response status message
   */
  message: string;

  /**
   * Get/Set response body.
   */
  body: any;

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
  type: string;

  constructor(private context: koa.Context, private response: koa.Response) {}

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
  redirect(url: string, status?: number): void {
    if (status) {
      this.context.status = status;
    }
    this.response.redirect(url);
  }

  /**
   * Transfer the file at the given `path`.
   *
   * Automatically sets the _Content-Type_ response header field.
   * The callback `fn(err)` is invoked when the transfer is complete
   * or when an error occurs. Be sure to check `res.sentHeader`
   * if you wish to attempt responding, as the header and some data
   * may have already been transferred.
   *
   * Options:
   *
   *   - `maxAge`   defaulting to 0 (can be string converted by `ms`)
   *   - `root`     root directory for relative filenames
   *   - `headers`  object of headers to serve with file
   *   - `dotfiles` serve dotfiles, defaulting to false; can be `"allow"` to send them
   *
   * Other options are passed along to `send`.
   *
   * Examples:
   *
   *  The following example illustrates how `res.sendFile()` may
   *  be used as an alternative for the `static()` middleware for
   *  dynamic situations. The code backing `res.sendFile()` is actually
   *  the same code, so HTTP cache support etc is identical.
   *
   *     app.get('/user/:uid/photos/:file', function(req, res){
   *       var uid = req.params.uid
   *         , file = req.params.file;
   *
   *       req.user.mayViewFilesFrom(uid, function(yes){
   *         if (yes) {
   *           res.sendFile('/uploads/' + uid + '/' + file);
   *         } else {
   *           res.send(403, 'Sorry! you cant see that.');
   *         }
   *       });
   *     });
   *
   * @api public
   */
  async sendFile(path: string, options?: any): Promise<void> {
    await send(this.context, path, options);
  }

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
  append(field: string, val: string | string[]): void {
    this.response.append(field, val);
  }

  /**
   * Set Content-Disposition header to "attachment" with optional `filename`.
   */
  attachment(filename: string): void {
    this.response.attachment(filename);
  }

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
  set(
    field: { [key: string]: string } | string,
    val?: string | string[]
  ): void {
    if (typeof field === 'string') {
      // cast to any (ts prob)
      this.response.set(field, <any>val);
    } else {
      this.response.set(field);
    }
  }

  /**
   * Vary on `field`.
   */
  vary(field: string): void {
    this.response.vary(field);
  }
}
