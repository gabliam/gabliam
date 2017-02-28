import { ValueRegistry } from './interfaces';

export class Registry {
    public registry = new Map<symbol | string, any[]>();

    addRegistry(subRegistry: Registry) {
        for (let [key, value] of subRegistry.registry) {
            this.get(key).push(...value);
        }
    }

   get<T extends ValueRegistry>(key: symbol| string):  T[] {
        if (!this.registry.has(key)) {
            this.registry.set(key, []);
        }

        return this.registry.get(key);
    }

    add<T  extends ValueRegistry>(key: symbol | string, target: T) {
        this.get(key).push(target);
    }

    remove(key: symbol) {
        this.registry.delete(key);
    }
}
