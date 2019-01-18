import * as Graph from 'graph-data-structure';
import * as _ from 'lodash';
import { InvalidPluginError, PluginDependencyIsMissingError } from './errors';
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
import { Plugin } from './metadatas';
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
      throw new InvalidPluginError();
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
    const graph = Graph();
    for (const plugin of this._plugins) {
      graph.addNode(plugin.name);
      // const orderedPlugin = [plugin.name];
      if (plugin.dependencies) {
        for (const deps of plugin.dependencies) {
          if (typeof deps.name !== 'string') {
            const def = this.add(deps.name);
            switch (deps.order) {
              case 'after':
                graph.addEdge(def.name, plugin.name);
                break;
              case 'before':
                graph.addEdge(plugin.name, def.name);
                break;
            }
          } else {
            if (!this.has(deps.name)) {
              throw new PluginDependencyIsMissingError(plugin.name, deps.name);
            }
            switch (deps.order) {
              case 'after':
                graph.addEdge(deps.name, plugin.name);
                break;
              case 'before':
                graph.addEdge(plugin.name, deps.name);
                break;
            }
          }
        }
      }
    }

    const listPlugin = graph
      .topologicalSort()
      .map<GabliamPluginDefinition>(p => this.findByName(p)!);

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
