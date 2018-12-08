import { Bean, Joi, PluginConfig, Value } from '@gabliam/core';
import { WebPluginConfig, WEB_PLUGIN_CONFIG } from '@gabliam/web-core';
import * as koaBody from 'koa-body';

const koaBodyFormidableOptions = Joi.object()
  .keys({
    /**
     * {Integer} Limits the amount of memory all fields together (except files) can allocate in bytes.
     * If this value is exceeded, an 'error' event is emitted. The default size is 20MB.
     */
    maxFileSize: Joi.number().integer(),

    /**
     * {Integer} Limits the number of fields that the querystring parser will decode, default 1000
     */
    maxFields: Joi.number().integer(),

    /**
     * {Integer} Limits the amount of memory all fields together (except files) can allocate in bytes.
     * If this value is exceeded, an 'error' event is emitted, default 2mb (2 * 1024 * 1024)
     */
    maxFieldsSize: Joi.number().integer(),

    /**
     * {String} Sets the directory for placing file uploads in, default os.tmpDir()
     */
    uploadDir: Joi.string(),

    /**
     * {Boolean} Files written to uploadDir will include the extensions of the original files, default false
     */
    keepExtensions: Joi.bool(),

    /**
     * {String} If you want checksums calculated for incoming files, set this to either 'sha1' or 'md5', default false
     */
    hash: Joi.string(),

    /**
     * {Boolean} Multiple file uploads or no, default true
     */
    multiples: Joi.bool(),

    /**
     * {Function} Special callback on file begin. The function is executed directly by formidable.
     * It can be used to rename files before saving them to disk. See https://github.com/felixge/node-formidable#filebegin
     */
    onFileBegin: Joi.func(),
  })
  .default({ extended: false });

const koaBodyOptions = Joi.object().keys({
  /**
   * {Boolean} Patch request body to Node's ctx.req, default false
   *
   * Note: You can patch request body to Node or Koa in same time if you want.
   */
  patchNode: Joi.bool(),

  /**
   * {Boolean} Patch request body to Koa's ctx.request, default true
   *
   * Note: You can patch request body to Node or Koa in same time if you want.
   */
  patchKoa: Joi.bool(),

  /**
   * {String|Integer} The byte (if integer) limit of the JSON body, default 1mb
   */
  jsonLimit: [Joi.string(), Joi.number().integer()],

  /**
   * {String|Integer} The byte (if integer) limit of the form body, default 56kb
   */
  formLimit: [Joi.string(), Joi.number().integer()],

  /**
   * {String|Integer} The byte (if integer) limit of the text body, default 56kb
   */
  textLimit: [Joi.string(), Joi.number().integer()],

  /**
   * {String} Sets encoding for incoming form fields, default utf-8
   */
  encoding: Joi.string(),

  /**
   * {Boolean} Parse multipart bodies, default false
   */
  multipart: Joi.bool(),

  /**
   * {Boolean} Parse urlencoded bodies, default true
   */
  urlencoded: Joi.bool(),

  /**
   * {Boolean} Parse text bodies, default true
   */
  text: Joi.bool(),

  /**
   * {Boolean} Parse json bodies, default true
   */
  json: Joi.bool(),

  /**
   * Toggles co-body strict mode; if true, only parses arrays or objects, default true
   */
  jsonStrict: Joi.bool(),

  /**
   * {Object} Options to pass to the formidable multipart parser
   */
  formidable: koaBodyFormidableOptions,

  /**
   * {Function} Custom error handle, if throw an error, you can customize the response - onError(error, context), default will throw
   */
  onError: Joi.func(),

  /**
   * {Boolean} If enabled, don't parse GET, HEAD, DELETE requests, default true
   *
   * GET, HEAD, and DELETE requests have no defined semantics for the request body,
   * but this doesn't mean they may not be valid in certain use cases.
   * koa-body is strict by default
   *
   * see http://tools.ietf.org/html/draft-ietf-httpbis-p2-semantics-19#section-6.3
   */
  strict: Joi.bool(),
});

export interface KoaConfig extends WebPluginConfig {
  koaBodyOptions: koaBody.IKoaBodyOptions;
}

@PluginConfig()
export class KoaPluginConfig implements KoaConfig {
  @Value('application.web.rootPath', Joi.string())
  rootPath = '/';

  @Value('application.web.port', Joi.number().positive())
  port: number = process.env.PORT ? parseInt(process.env.PORT!, 10) : 3000;

  @Value('application.web.hostname', Joi.string())
  hostname: string;

  @Value('application.web.koaBodyOptions', koaBodyOptions)
  koaBodyOptions: koaBody.IKoaBodyOptions;

  @Bean(WEB_PLUGIN_CONFIG)
  restConfig(): KoaConfig {
    return {
      rootPath: this.rootPath,
      port: this.port,
      hostname: this.hostname,
      koaBodyOptions: this.koaBodyOptions,
    };
  }
}
