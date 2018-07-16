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
import { configureValueExtractor, callInstance } from './utils';
import { PluginList } from './plugin-list';
import {
  GabliamConfig,
  GabliamPluginConstructor,
  ConfigRegistry,
  BeanMetadata,
  ValueRegistry,
  PreDestroyRegistry
} from './interfaces';
import { ExpressionParser } from '@gabliam/expression';

const debug = d('Gabliam:core');

const DEFAULT_CONFIG: GabliamConfig = {
  config: process.env.GABLIAM_CONFIG_PATH
};

/**
 * Gabliam
 */
export class Gabliam {
  public container: Container = createContainer();

  public config: object;

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
          ...DEFAULT_CONFIG,
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
   * Add a plugin
   * @param  {GabliamPluginConstructor} plugin
   * @returns Gabliam
   */
  public addPlugin(plugin: GabliamPluginConstructor): Gabliam {
    this.pluginList.add(plugin);
    return this;
  }
  /**
   * Add any plugins
   * @param  {GabliamPluginConstructor[]} ...plugins
   * @returns Gabliam
   */
  public addPlugins(...plugins: GabliamPluginConstructor[]): Gabliam {
    for (const plugin of plugins) {
      this.addPlugin(plugin);
    }
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
   * Stop and destroy gabliam application
   * @returns Promise
   */
  async stopAndDestroy(): Promise<Gabliam> {
    await this.stop();
    await this.destroy();
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

    const values = this.registry.get<PreDestroyRegistry>(TYPE.PreDestroy);

    const instanceToDestroy = async (
      value: ValueRegistry<PreDestroyRegistry>
    ) => {
      if (value.options) {
        const instance = this.container.get(value.id);
        for (const preDestroy of value.options.preDestroys) {
          await callInstance(instance, preDestroy);
        }
      }
    };

    const p = [];
    for (const value of values) {
      p.push(instanceToDestroy(value));
    }

    await Promise.all(p);

    return this;
  }

  /**
   * Load config file and bind result in APP_CONFIG
   */
  private async _initializeConfig() {
    this.config = await this.loaderConfig.load(this.options.config);
    const config = this.config;
    this.container.bind(APP_CONFIG).toConstantValue(config);
    this.container
      .bind(VALUE_EXTRACTOR)
      .toConstantValue(configureValueExtractor(this.container));
    this.container
      .bind(ExpressionParser)
      .toConstantValue(new ExpressionParser(config));
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

    // Get all config classes in registry
    let configsRegistry = this.registry.get<ConfigRegistry>(TYPE.Config);

    debug('configsRegistry', configsRegistry);
    if (configsRegistry) {
      configsRegistry = _.sortBy(configsRegistry, 'options.order');

      for (const { id: configId } of configsRegistry) {
        // Get config instance
        const confInstance = this.container.get<object>(configId);

        // get all bean metadata in config classes
        const beanMetadatas: BeanMetadata[] = Reflect.getMetadata(
          METADATA_KEY.bean,
          confInstance.constructor
        );

        // get on missing bean metadata
        const onMissingBeanMetadatas: BeanMetadata[] =
          Reflect.getMetadata(
            METADATA_KEY.onMissingBean,
            confInstance.constructor
          ) || [];

        const beforeCreateMetas: string[] = Reflect.getMetadata(
          METADATA_KEY.beforeCreate,
          confInstance.constructor
        );

        const initMetadas: string[] = Reflect.getMetadata(
          METADATA_KEY.init,
          confInstance.constructor
        );

        // call all beforeCreate method if exist
        if (Array.isArray(beforeCreateMetas)) {
          // No promise.all and await because order of beans are important
          for (const metada of beforeCreateMetas) {
            await callInstance(confInstance, metada);
          }
        }

        // If config has bean metadata
        if (Array.isArray(beanMetadatas)) {
          // No promise.all and await because order of beans are important
          for (const { id, key } of beanMetadatas) {
            const onMissingBeans = onMissingBeanMetadatas.filter(
              m => m.key === key
            );

            // by default all bean are missing
            let allMissing = true;

            // if there are onMissingBeans config, check if bean exist or no
            for (const onMissingBean of onMissingBeans) {
              try {
                this.container.getAll(onMissingBean.id);
                allMissing = false;
              } catch {}
            }

            // if all beans are missing, so we create the bean
            if (allMissing) {
              const bean = await callInstance(confInstance, key);
              this.container.bind(id).toConstantValue(bean);

              // bean can return undefined or can be a constant value
              if (
                bean &&
                bean.constructor &&
                Reflect.hasMetadata(METADATA_KEY.preDestroy, bean.constructor)
              ) {
                const preDestroys: Array<string | symbol> = Reflect.getMetadata(
                  METADATA_KEY.preDestroy,
                  bean.constructor
                );
                this.registry.add(TYPE.PreDestroy, <ValueRegistry>{
                  id,
                  target: bean,
                  options: {
                    preDestroys
                  }
                });
              }
            }
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
