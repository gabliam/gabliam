import * as inversify from 'inversify';
import * as interfaces from './interfaces';
import * as _ from 'lodash';
import { TYPE, METADATA_KEY, APP_CONFIG, CORE_CONFIG } from './constants';
import { Loader } from './loader';
import { createContainer } from './container';
import { Registry } from './registry';
import * as d from 'debug';

const debug = d('Gabliam:core');

const DEFAULT_CONFIG: interfaces.GabliamOptions = {
  scanPath: process.env.PWD,
  configPath: process.env.GABLIAM_CONFIG_PATH || process.env.PWD
};

/**
 * Gabliam
 */
export class Gabliam {
  private _loader: Loader = new Loader();

  private _plugins: interfaces.GabliamPlugin[] = [];
  private _options: interfaces.GabliamOptions;
  public container: inversify.interfaces.Container = createContainer();

  public config: any;

  /**
   * Registry
   */
  public registry: Registry;

  /**
   * Constructor
   * @param  {interfaces.GabliamConfig|string} options?
   */
  constructor(options?: interfaces.GabliamConfig | string) {
    if (options === undefined) {
      this._options = DEFAULT_CONFIG;
    } else {
      if (_.isString(options)) {
        this._options = {
          scanPath: options,
          configPath: options
        };
      } else {
        this._options = {
          ...DEFAULT_CONFIG,
          ...options
        };
      }
    }

    this.container.bind<interfaces.GabliamConfig>(CORE_CONFIG).toConstantValue(this._options);
  }
  /**
   * Add a plugin order
   * @param  {interfaces.GabliamPluginConstructor} ctor
   * @returns Gabliam
   */
  public addPlugin(ctor: interfaces.GabliamPluginConstructor): Gabliam {
    this._plugins.push(new ctor());
    return this;
  }

  /**
   * Build gabliam
   * @returns Promise
   */
  public async build(): Promise<Gabliam> {
    /**
     * Load config file
     */
    this._initializeConfig();

    /**
     * Loading phase
     */
    this.registry = this._loader.loadModules(this._options.scanPath, this._plugins);

    /**
     * Binding phase
     */
    this._bind();

    /**
     * Config phase
     */
    await this._loadConfig();

    /**
     * building phase
     */
    this._plugins
      .filter(plugin => _.isFunction(plugin.build))
      .forEach(plugin => plugin.build!(this.container, this.registry));

    return this;
  }


  /**
   * Load config file and bind result in APP_CONFIG
   */
  private _initializeConfig() {
    const config = this.config = this._loader.loadConfig(this._options.configPath);
    this.container.bind<any>(APP_CONFIG).toConstantValue(config);
  }

  /**
   * Binding phase
   * Binding of config and service classes.
   * call all plugin.bind
   */
  private _bind() {
    debug('_bind');
    this.registry.get(TYPE.Config)
      .forEach(({ id, target }) => this.container.bind<any>(id).to(target).inSingletonScope());

    this.registry.get(TYPE.Service)
      .forEach(({ id, target }) => this.container.bind<any>(id).to(target).inSingletonScope());

    this._plugins
      .filter(plugin => _.isFunction(plugin.bind))
      .forEach(plugin => plugin.bind!(this.container, this.registry));
  }

  /**
   * Config phase
   */
  private async _loadConfig() {
    debug('_loadConfig');
    async function callInstance(instance: any, key: string) {
      return Promise.resolve(instance[key]());
    }

    // list of plugins with config phase
    const pluginConfig = this._plugins
      .filter(plugin => _.isFunction(plugin.config));

    let configsRegistry = this.registry.get<interfaces.ConfigRegistry>(TYPE.Config);


    debug('configsRegistry', configsRegistry);
    if (configsRegistry) {
      configsRegistry = _.sortBy(configsRegistry, 'order');

      for (const { id: configId } of configsRegistry) {
        const confInstance = this.container.get<object>(configId);

        const beanMetadata: interfaces.BeanMetadata[] = Reflect.getOwnMetadata(
          METADATA_KEY.bean,
          confInstance.constructor
        );

        if (beanMetadata) {
          // No promise.all and await because order of beans are important
          for (const metadata of beanMetadata) {
            this.container
              .bind<any>(metadata.id)
              .toConstantValue(await callInstance(confInstance, metadata.key));
          }
        }

        pluginConfig.forEach(plugin => plugin.config!(this.container, this.registry, confInstance));
      }
    }
    debug('_loadConfig end');
  }
  /**
   * Build and start gabliam application
   * @returns Promise
   */
  async buildAndStart(): Promise<Gabliam> {
    await this.build();
    await this.start();
    return this;
  }

  /**
   * Start gabliam application
   *
   * call all plugin.start
   * @returns Promise
   */
  async start(): Promise<Gabliam> {
    const pluginsStart = this._plugins
      .filter(plugin => _.isFunction(plugin.start))
      .map(plugin => plugin.start!(this.container, this.registry));

    await Promise.all(pluginsStart);
    return this;
  }

  /**
   * Stop gabliam application
   * call all plugin.stop
   *
   * @returns Promise
   */
  async stop(): Promise<Gabliam> {
    const pluginsStop = this._plugins
      .filter(plugin => _.isFunction(plugin.stop))
      .map(plugin => plugin.stop!(this.container, this.registry));

    await Promise.all(pluginsStop);
    return this;
  }

  /**
   * Destroy gabliam application
   * call all plugin.destroy
   *
   * @returns Promise
   */
  async destroy(): Promise<Gabliam> {
    const pluginsDestroy = this._plugins
      .filter(plugin => _.isFunction(plugin.destroy))
      .map(plugin => plugin.destroy!(this.container, this.registry));

    await Promise.all(pluginsDestroy);
    return this;
  }
}
