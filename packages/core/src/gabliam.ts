import * as inversify from 'inversify';
import * as interfaces from './interfaces';
import * as _ from 'lodash';
import {
  TYPE,
  METADATA_KEY,
  APP_CONFIG,
  CORE_CONFIG,
  VALUE_EXTRACTOR
} from './constants';
import { Loader } from './loader';
import { createContainer } from './container';
import { Registry } from './registry';
import * as d from 'debug';
import { configureValueExtractor } from './utils';

const debug = d('Gabliam:core');

const DEFAULT_CONFIG: interfaces.GabliamConfig = {
  scanPath: process.env.PWD!,
  configPath: process.env.GABLIAM_CONFIG_PATH || process.env.PWD!
};

/**
 * Gabliam
 */
export class Gabliam {
  public container: inversify.interfaces.Container = createContainer();

  public config: any;

  /**
   * Registry
   */
  public registry: Registry = new Registry();

  public loader: Loader = new Loader();

  public plugins: interfaces.GabliamPlugin[] = [];

  public options: interfaces.GabliamConfig;

  /**
   * Constructor
   * @param  {interfaces.GabliamConfig|string} options?
   */
  constructor(options?: Partial<interfaces.GabliamConfig> | string) {
    if (options === undefined) {
      this.options = DEFAULT_CONFIG;
    } else {
      if (_.isString(options)) {
        this.options = {
          scanPath: options,
          configPath: options
        };
      } else {
        this.options = {
          ...DEFAULT_CONFIG,
          ...options
        };
      }
    }
    /**
     * @TODO move in building phase
     */
    this.container.bind(CORE_CONFIG).toConstantValue(this.options);
  }
  /**
   * Add a plugin order
   * @param  {interfaces.GabliamPluginConstructor} ctor
   * @returns Gabliam
   */
  public addPlugin(ctor: interfaces.GabliamPluginConstructor): Gabliam {
    this.plugins.push(new ctor());
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
    this.registry.addRegistry(
      this.loader.loadModules(this.options.scanPath, this.plugins)
    );

    /**
     * Binding phase
     */
    await this._bind();

    /**
     * Config phase
     */
    await this._loadConfig();

    /**
     * building phase
     */
    const pluginsWithBuild = this.plugins.filter(plugin =>
      _.isFunction(plugin.build)
    );

    for (const plugin of pluginsWithBuild) {
      await Promise.resolve(plugin.build!(this.container, this.registry));
    }

    return this;
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
    const pluginsWithStart = this.plugins.filter(plugin =>
      _.isFunction(plugin.start)
    );

    for (const plugin of pluginsWithStart) {
      await plugin.start!(this.container, this.registry);
    }

    return this;
  }

  /**
   * Stop gabliam application
   * call all plugin.stop
   *
   * @returns Promise
   */
  async stop(): Promise<Gabliam> {
    const pluginsWithStop = this.plugins.filter(plugin =>
      _.isFunction(plugin.stop)
    );

    for (const plugin of pluginsWithStop) {
      await plugin.stop!(this.container, this.registry);
    }

    return this;
  }

  /**
   * Destroy gabliam application
   * call all plugin.destroy
   *
   * @returns Promise
   */
  async destroy(): Promise<Gabliam> {
    const pluginsWithDestroy = this.plugins.filter(plugin =>
      _.isFunction(plugin.destroy)
    );

    for (const plugin of pluginsWithDestroy) {
      await plugin.destroy!(this.container, this.registry);
    }

    return this;
  }

  /**
   * Load config file and bind result in APP_CONFIG
   */
  private _initializeConfig() {
    const config = (this.config = this.loader.loadConfig(
      this.options.configPath
    ));
    this.container.bind(APP_CONFIG).toConstantValue(config);
    this.container
      .bind(VALUE_EXTRACTOR)
      .toConstantValue(configureValueExtractor(this.container));
  }

  /**
   * Binding phase
   * Binding of config and service classes.
   * call all plugin.bind
   */
  private async _bind() {
    debug('_bind');
    this.registry
      .get(TYPE.Config)
      .forEach(({ id, target }) =>
        this.container.bind(id).to(target).inSingletonScope()
      );

    this.registry
      .get(TYPE.Service)
      .forEach(({ id, target }) =>
        this.container.bind(id).to(target).inSingletonScope()
      );

    const pluginsWithBind = this.plugins.filter(plugin =>
      _.isFunction(plugin.bind)
    );

    for (const plugin of pluginsWithBind) {
      await Promise.resolve(plugin.bind!(this.container, this.registry));
    }
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
    const pluginConfig = this.plugins.filter(plugin =>
      _.isFunction(plugin.config)
    );

    let configsRegistry = this.registry.get<interfaces.ConfigRegistry>(
      TYPE.Config
    );

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
              .bind(metadata.id)
              .toConstantValue(await callInstance(confInstance, metadata.key));
          }
        }

        for (const plugin of pluginConfig) {
          await Promise.resolve(
            plugin.config!(this.container, this.registry, confInstance)
          );
        }
      }
    }
    debug('_loadConfig end');
  }
}
