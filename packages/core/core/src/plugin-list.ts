import { Graph } from 'gert';
import * as TopoSort from 'gert-topo-sort';
import * as _ from 'lodash';
import { ERRORS_MSGS } from './constants';
import {
  GabliamPlugin,
  GabliamPluginConstructor,
  GabliamPluginDefinition,
  GabliamPluginWithBind,
  GabliamPluginWithBuild,
  GabliamPluginWithConfig,
  GabliamPluginWithDestroy,
  GabliamPluginWithStart,
  GabliamPluginWithStop,
  PluginDependency,
} from './interfaces';
import { Plugin } from './metadata';
import { reflection } from './reflection';

/**
 * Plugin registry
 */
export class PluginList {
  private _plugins: GabliamPluginDefinition[] = [];

  /**
   * Add a plugin
   */
  add(ctor: GabliamPluginConstructor): GabliamPluginDefinition {
    const pluginMetadata = reflection.annotationsOfDecorator<Plugin>(
      ctor,
      Plugin
    );

    // if class doesn't have plugin metadata, so throw error
    if (pluginMetadata.length === 0) {
      throw new Error(ERRORS_MSGS.INVALID_PLUGIN);
    }

    const [{ name: pluginName }] = (
      reflection.annotationsOfDecorator<Plugin>(ctor, Plugin, false) || []
    ).slice(-1);

    const name = pluginName || ctor.name;

    // get all dependencies (inherit)
    const dependencies = pluginMetadata.reduce<PluginDependency[]>(
      (prev, current) => {
        prev.push(...current.dependencies);
        return prev;
      },
      []
    );

    const def: GabliamPluginDefinition = {
      name,
      dependencies,
      plugin: new ctor(),
    };
    this._plugins.push(def);
    return def;
  }

  /**
   * Sort plugin with the good order
   */
  sort() {
    const vertices: { [k: string]: string[] } = {};
    for (const plugin of this._plugins) {
      const orderedPlugin = [plugin.name];
      if (plugin.dependencies) {
        for (const deps of plugin.dependencies) {
          if (typeof deps.name !== 'string') {
            const def = this.add(deps.name);
            switch (deps.order) {
              case 'after':
                orderedPlugin.unshift(def.name);
                break;
              case 'before':
                orderedPlugin.push(def.name);
                break;
            }
          } else {
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
      }

      while (orderedPlugin.length && orderedPlugin[0] !== plugin.name) {
        const name = orderedPlugin.shift()!;
        /* istanbul ignore next */
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
      vertices,
    });

    // Rewrite listPlugin
    const listPlugin = TopoSort(graph).map<GabliamPluginDefinition>(
      p => this.findByName(p)!
    );

    this._plugins = listPlugin;
  }

  /**
   * Checks if `name` is in plugin list.
   */
  has(name: string) {
    return !!this.findByName(name);
  }

  /**
   * Find if `name` is in plugin list
   */
  findByName(name: string) {
    return this._plugins.find(p => p.name === name);
  }

  /**
   * return list of plugin
   */
  get plugins(): GabliamPlugin[] {
    // use this._plugins.map for immutability
    return this._plugins.map(p => p.plugin);
  }

  /**
   * return plugin with build phase
   */
  get pluginsWithBuild(): GabliamPluginWithBuild[] {
    return <GabliamPluginWithBuild[]>(
      this.plugins.filter(plugin => _.isFunction(plugin.build))
    );
  }

  /**
   * return plugin with start phase
   */
  get pluginsWithStart(): GabliamPluginWithStart[] {
    return <GabliamPluginWithStart[]>(
      this.plugins.filter(plugin => _.isFunction(plugin.start))
    );
  }

  /**
   * return plugin with stop phase
   */
  get pluginsWithStop(): GabliamPluginWithStop[] {
    return <GabliamPluginWithStop[]>(
      this.plugins.filter(plugin => _.isFunction(plugin.stop))
    );
  }

  /**
   * return plugin with destroy phase
   */
  get pluginsWithDestroy(): GabliamPluginWithDestroy[] {
    return <GabliamPluginWithDestroy[]>(
      this.plugins.filter(plugin => _.isFunction(plugin.destroy))
    );
  }

  /**
   * return plugin with bind phase
   */
  get pluginsWithBind(): GabliamPluginWithBind[] {
    return <GabliamPluginWithBind[]>(
      this.plugins.filter(plugin => _.isFunction(plugin.bind))
    );
  }

  /**
   * return plugin with config phase
   */
  get pluginWithConfig(): GabliamPluginWithConfig[] {
    return <GabliamPluginWithConfig[]>(
      this.plugins.filter(plugin => _.isFunction(plugin.config))
    );
  }
}
