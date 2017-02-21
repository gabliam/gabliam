import { DecoratorRegistry } from './interfaces';

export class Registry {
    private registry = new Map<symbol, any[]>();

   get<T extends DecoratorRegistry>(key: symbol):  T[] {
        if (!this.registry.has(key)) {
            this.registry.set(key, []);
        }

        return this.registry.get(key);
    }

    add<T  extends DecoratorRegistry>(key: symbol, target: T) {
        this.get(key).push(target);
    }

    remove(key: symbol) {
        this.registry.delete(key);
    }
}

export const registry = new Registry();
