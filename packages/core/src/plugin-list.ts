import {
  GabliamPluginDefinition,
  GabliamPluginConstructor,
  PluginMetadata,
  GabliamPlugin
} from './interfaces';
import { METADATA_KEY, ERRORS_MSGS } from './constants';
import * as _ from 'lodash';
import { Graph } from 'gert';
import * as TopoSort from 'gert-topo-sort';

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
    const vertices: { [k: string]: string[] } = {};
    for (const plugin of this._plugins) {
      const orderedPlugin = [plugin.name];
      if (plugin.dependencies) {
        for (const deps of plugin.dependencies) {
          if (!this.has(deps.name)) {
            throw new Error(
              `The plugin ${plugin.name} need the plugin ${deps.name}}`
            );
          }
          switch (deps.order) {
            case 'after':
              orderedPlugin.unshift(deps.name);
              break;
            case 'before':
              orderedPlugin.push(deps.name);
              break;
          }
        }
      }
      while (orderedPlugin.length && orderedPlugin[0] !== plugin.name) {
        const name = orderedPlugin.shift()!;
        const index =
          orderedPlugin.indexOf(plugin.name) === orderedPlugin.length
            ? orderedPlugin.length
            : orderedPlugin.indexOf(plugin.name) + 1;
        const toAdd = _.without(orderedPlugin.slice(0, index), name);
        if (!vertices[name]) {
          vertices[name] = [];
        }

        vertices[name].push(...toAdd);
        vertices[name] = _.uniq(vertices[name]);
      }

      if (!vertices[plugin.name]) {
        vertices[plugin.name] = [];
      }

      vertices[plugin.name].push(
        ..._.without(orderedPlugin.slice(1), plugin.name)
      );
      vertices[plugin.name] = _.uniq(vertices[plugin.name]);
    }

    const graph = new Graph({
      directed: true,
      vertices
    });

    // Rewrite listPlugin
    const listPlugin = TopoSort(graph).map<GabliamPluginDefinition>(
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
