import {
  GabliamPluginDefinition,
  GabliamPluginConstructor,
  PluginMetadata,
  GabliamPlugin
} from './interfaces';
import { METADATA_KEY, ERRORS_MSGS } from './constants';
import * as _ from 'lodash';

export class PluginList {
  private _plugins: GabliamPluginDefinition[] = [];

  add(ctor: GabliamPluginConstructor) {
    const pluginMetadata = <PluginMetadata | undefined>Reflect.getOwnMetadata(
      METADATA_KEY.plugin,
      ctor
    );

    if (!pluginMetadata) {
      throw new Error(ERRORS_MSGS.INVALID_PLUGIN);
    }

    if (pluginMetadata.dependencies.length) {
      for (const dep of pluginMetadata.dependencies) {
        if (!this.has(dep)) {
          throw new Error(
            `The plugin ${pluginMetadata.name} need the plugin ${dep}}`
          );
        }
      }
    }

    this._plugins.push({ name: pluginMetadata.name, plugin: new ctor() });
  }

  has(name: string) {
    return !!this.findByName(name);
  }

  findByName(name: string) {
    return this._plugins.find(p => p.name === name);
  }

  get plugins(): GabliamPlugin[] {
    return this._plugins.map(p => p.plugin);
  }

  get pluginsWithBuild(): GabliamPlugin[] {
    return this.plugins.filter(plugin => _.isFunction(plugin.build));
  }

  get pluginsWithStart(): GabliamPlugin[] {
    return this.plugins.filter(plugin => _.isFunction(plugin.start));
  }

  get pluginsWithStop(): GabliamPlugin[] {
    return this.plugins.filter(plugin => _.isFunction(plugin.stop));
  }

  get pluginsWithDestroy(): GabliamPlugin[] {
    return this.plugins.filter(plugin => _.isFunction(plugin.destroy));
  }

  get pluginsWithBind(): GabliamPlugin[] {
    return this.plugins.filter(plugin => _.isFunction(plugin.bind));
  }

  get pluginWithConfig(): GabliamPlugin[] {
    return this.plugins.filter(plugin => _.isFunction(plugin.config));
  }
}
