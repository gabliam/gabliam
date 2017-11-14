import * as _ from 'lodash';
import {
  TYPE,
  METADATA_KEY,
  APP_CONFIG,
  CORE_CONFIG,
  VALUE_EXTRACTOR
} from './constants';
import { LoaderModule, LoaderConfig } from './loaders';
import { createContainer, Container } from './container';
import { Registry } from './registry';
import * as d from 'debug';
import { configureValueExtractor } from './utils';
import { PluginList } from './plugin-list';
import {
  GabliamConfig,
  GabliamPluginConstructor,
  ConfigRegistry,
  BeanMetadata
} from './interfaces';

const debug = d('Gabliam:core');

const DEFAULT_CONFIG: GabliamConfig = {
  scanPath: process.env.PWD!,
  config: process.env.GABLIAM_CONFIG_PATH || process.env.PWD!
};

/**
 * Gabliam
 */
export class Gabliam {
  public container: Container = createContainer();

  public config: any;

  /**
   * Registry
   */
  public registry: Registry = new Registry();

  /**
   * Module loader
   */
  public loaderModule: LoaderModule = new LoaderModule();

  /**
   * Config loader
   */
  public loaderConfig: LoaderConfig = new LoaderConfig();

  /**
   * Plugin list
   */
  public pluginList: PluginList = new PluginList();

  public options: GabliamConfig;

  /**
   * Constructor
   * @param  {GabliamConfig|string} options?
   */
  constructor(options?: Partial<GabliamConfig> | string) {
    if (options === undefined) {
      this.options = DEFAULT_CONFIG;
    } else {
      if (_.isString(options)) {
        this.options = {
          scanPath: options,
          config: options
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
   * @param  {GabliamPluginConstructor} ctor
   * @returns Gabliam
   */
  public addPlugin(ctor: GabliamPluginConstructor): Gabliam {
    this.pluginList.add(ctor);
    return this;
  }

  /**
   * Build gabliam
   * @returns Promise
   */
  public async build(): Promise<Gabliam> {
    this.pluginList.sort();

    /**
     * Load config file
     */
    await this._initializeConfig();

    /**
     * Loading phase
     */
    this.registry.addRegistry(
      this.loaderModule.load(this.options.scanPath, this.pluginList.plugins)
    );

    /**
     * Binding phase
     */
    await this._bind();

    /**
     * Config phase
     */
    await this._loadConfig();

    for (const plugin of this.pluginList.pluginsWithBuild) {
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
    for (const plugin of this.pluginList.pluginsWithStart) {
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
    for (const plugin of this.pluginList.pluginsWithStop) {
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
    for (const plugin of this.pluginList.pluginsWithDestroy) {
      await plugin.destroy!(this.container, this.registry);
    }

    return this;
  }

  /**
   * Load config file and bind result in APP_CONFIG
   */
  private async _initializeConfig() {
    this.config = await this.loaderConfig.load(
      this.options.scanPath,
      this.options.config
    );
    const config = this.config;
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
    // register all config files
    this.registry.get(TYPE.Config).forEach(({ id, target }) =>
      this.container
        .bind(id)
        .to(target)
        .inSingletonScope()
    );

    // register all service files
    this.registry.get(TYPE.Service).forEach(({ id, target }) =>
      this.container
        .bind(id)
        .to(target)
        .inSingletonScope()
    );

    for (const plugin of this.pluginList.pluginsWithBind) {
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

    let configsRegistry = this.registry.get<ConfigRegistry>(TYPE.Config);

    debug('configsRegistry', configsRegistry);
    if (configsRegistry) {
      configsRegistry = _.sortBy(configsRegistry, 'options.order');

      for (const { id: configId } of configsRegistry) {
        const confInstance = this.container.get<object>(configId);

        const beanMetadatas: BeanMetadata[] = Reflect.getOwnMetadata(
          METADATA_KEY.bean,
          confInstance.constructor
        );

        const initMetadas: string[] = Reflect.getOwnMetadata(
          METADATA_KEY.init,
          confInstance.constructor
        );

        // If config has bean metadata
        if (Array.isArray(beanMetadatas)) {
          // No promise.all and await because order of beans are important
          for (const beanMetadata of beanMetadatas) {
            this.container
              .bind(beanMetadata.id)
              .toConstantValue(
                await callInstance(confInstance, beanMetadata.key)
              );
          }
        }

        if (Array.isArray(initMetadas)) {
          // No promise.all and await because order of beans are important
          for (const metada of initMetadas) {
            await callInstance(confInstance, metada);
          }
        }

        for (const plugin of this.pluginList.pluginWithConfig) {
          await Promise.resolve(
            plugin.config!(this.container, this.registry, confInstance)
          );
        }
      }
    }
    debug('_loadConfig end');
  }
}
