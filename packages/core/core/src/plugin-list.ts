import Graph from 'graph-data-structure';
import _ from 'lodash';
import { InvalidPluginError, PluginDependencyIsMissingError } from './errors';
import {
  GabliamAddPlugin,
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

const getPluginDefinition = (
  definition: GabliamAddPlugin,
): GabliamPluginDefinition => {
  let pluginMetadata = reflection.annotationsOfDecorator<Plugin>(
    definition,
    Plugin,
  );

  let ctor: GabliamPluginConstructor | undefined;
  let plugin: GabliamPlugin | undefined;
  // if class doesn't have plugin metadata, so throw error
  if (pluginMetadata.length === 0 && definition.constructor) {
    pluginMetadata = reflection.annotationsOfDecorator<Plugin>(
      definition.constructor,
      Plugin,
    );
    if (pluginMetadata.length !== 0) {
      plugin = <GabliamPlugin>definition;
      ctor = <GabliamPluginConstructor>definition.constructor;
    }
  } else {
    ctor = <GabliamPluginConstructor>definition;
    // eslint-disable-next-line new-cap
    plugin = new ctor();
  }

  if (ctor === undefined || plugin === undefined) {
    throw new InvalidPluginError();
  }

  const [{ name: pluginName, beforeAll }] = (
    reflection.annotationsOfDecorator<Plugin>(ctor, Plugin, false) || []
  ).slice(-1);

  const name = pluginName || ctor.name;

  const dependencies = pluginMetadata.reduce<PluginDependency[]>(
    (prev, current) => {
      prev.push(...current.dependencies);
      return prev;
    },
    [],
  );

  return { plugin, name, dependencies, beforeAll };
};

/**
 * Plugin registry
 */
export class PluginList {
  private _plugins: GabliamPluginDefinition[] = [];

  /**
   * return list of plugin
   */
  get plugins(): GabliamPlugin[] {
    // use this._plugins.map for immutability
    return this._plugins.map((p) => p.plugin);
  }

  /**
   * return plugin with build phase
   */
  get pluginsWithBuild(): GabliamPluginWithBuild[] {
    return <GabliamPluginWithBuild[]>(
      this.plugins.filter((plugin) => _.isFunction(plugin.build))
    );
  }

  /**
   * return plugin with start phase
   */
  get pluginsWithStart(): GabliamPluginWithStart[] {
    return <GabliamPluginWithStart[]>(
      this.plugins.filter((plugin) => _.isFunction(plugin.start))
    );
  }

  /**
   * return plugin with stop phase
   */
  get pluginsWithStop(): GabliamPluginWithStop[] {
    return <GabliamPluginWithStop[]>(
      this.plugins.filter((plugin) => _.isFunction(plugin.stop))
    );
  }

  /**
   * return plugin with destroy phase
   */
  get pluginsWithDestroy(): GabliamPluginWithDestroy[] {
    return <GabliamPluginWithDestroy[]>(
      this.plugins.filter((plugin) => _.isFunction(plugin.destroy))
    );
  }

  /**
   * return plugin with bind phase
   */
  get pluginsWithBind(): GabliamPluginWithBind[] {
    return <GabliamPluginWithBind[]>(
      this.plugins.filter((plugin) => _.isFunction(plugin.bind))
    );
  }

  /**
   * return plugin with config phase
   */
  get pluginWithConfig(): GabliamPluginWithConfig[] {
    return <GabliamPluginWithConfig[]>(
      this.plugins.filter((plugin) => _.isFunction(plugin.config))
    );
  }

  /**
   * Add a plugin
   */
  add(definition: GabliamAddPlugin): GabliamPluginDefinition {
    const def = getPluginDefinition(definition);
    this._plugins.push(def);
    return def;
  }

  /**
   * Sort plugin with the good order
   */
  sort() {
    const graph = Graph();
    const beforeAll = [];
    for (const plugin of this._plugins) {
      if (plugin.beforeAll) {
        beforeAll.push(plugin.name);
      }
    }

    for (const plugin of this._plugins) {
      graph.addNode(plugin.name);

      beforeAll.forEach((def) => graph.addEdge(def, plugin.name));

      // const orderedPlugin = [plugin.name];
      if (plugin.dependencies) {
        for (const deps of plugin.dependencies) {
          if (typeof deps.name !== 'string') {
            const def = this.add(deps.name);
            // eslint-disable-next-line default-case
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
            // eslint-disable-next-line default-case
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map<GabliamPluginDefinition>((p) => this.findByName(p)!);

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
    return this._plugins.find((p) => p.name === name);
  }
}
