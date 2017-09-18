import {
  GabliamPluginDefinition,
  GabliamPluginConstructor,
  PluginMetadata,
  GabliamPlugin
} from './interfaces';
import { METADATA_KEY, ERRORS_MSGS } from './constants';
import * as _ from 'lodash';
import * as Topo from 'topo';

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

    this._plugins.push({ ...pluginMetadata, plugin: new ctor() });
  }

  sort() {
    const treePlugin = new Topo();

    for (const plugin of this._plugins) {
      const after = [];
      const before = [];
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.has(dep.name)) {
            throw new Error(
              `The plugin ${plugin.name} need the plugin ${dep.name}}`
            );
          }
          switch (dep.order) {
            case 'before':
              before.unshift(dep.name);
              break;
            case 'after':
              after.push(dep.name);
              break;
          }
        }
      }
      treePlugin.add(plugin.name, { after, before });
    }

    const sortedPlugins = <string[]>treePlugin.nodes;
    const listPlugin = sortedPlugins.map<GabliamPluginDefinition>(
      p => this.findByName(p)!
    );
    this._plugins = listPlugin;
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
