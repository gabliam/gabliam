import { ValueRegistry } from './interfaces';
import * as _ from 'lodash';

/**
 * Registry of all classes in gabliam instance
 */
export class Registry {
  public registry = new Map<symbol | string, Array<ValueRegistry<any>>>();

  /**
   * Add a sub registry
   * @param  {Registry} subRegistry
   */
  addRegistry(subRegistry: Registry) {
    for (const [type, value] of subRegistry.registry) {
      this.get(type).push(...value);
    }
  }
  /**
   * Get values of type in  a registry
   * @param  {symbol|string} type
   * @returns T[] return the list of velue
   */
  get<T>(type: symbol | string): Array<ValueRegistry<T>> {
    if (!this.registry.has(type)) {
      this.registry.set(type, []);
    }

    return this.registry.get(type)!;
  }
  /**
   * Add value in registry for a type
   * @param  {symbol|string} type
   * @param  {T} target
   */
  add<T extends ValueRegistry<T>>(
    type: symbol | string,
    target: ValueRegistry<T>
  ) {
    const values = this.get(type);
    if (!_.find(values, target)) {
      values.push(target);
    }
  }

  /**
   * Remove all values for a type
   * @param  {symbol} type
   */
  remove(type: symbol | string) {
    this.registry.delete(type);
  }
}
