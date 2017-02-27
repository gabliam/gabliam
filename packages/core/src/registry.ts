import { DecoratorRegistry } from './interfaces';

export class Registry {
    private registry = new Map<symbol | string, any[]>();
    private paths: string[] = [];

   get<T extends DecoratorRegistry>(key: symbol| string):  T[] {
        if (!this.registry.has(key)) {
            this.registry.set(key, []);
        }

        return this.registry.get(key);
    }

    add<T  extends DecoratorRegistry>(key: symbol | string, target: T) {
        this.get(key).push(target);
    }

    addPath(path: string) {
        this.paths.push(path);
    }

    getPaths() {
        return this.paths;
    }

    remove(key: symbol) {
        this.registry.delete(key);
    }
}

export const registry = new Registry();
