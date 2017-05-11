import { ValueRegistry } from './interfaces';


/**
 * Registry
 */
export class Registry {
  public registry = new Map<symbol | string, any[]>();

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
  get<T extends ValueRegistry>(type: symbol | string): T[] {
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
  add<T extends ValueRegistry>(type: symbol | string, target: T) {
    this.get(type).push(target);
  }


  /**
   * Remove all values for a type
   * @param  {symbol} type
   */
  remove(type: symbol | string) {
    this.registry.delete(type);
  }
}
