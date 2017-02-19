export class Registry {
    private registry = new Map<symbol, any>();

   get<T>(key: symbol):  T[] {
        if (!this.registry.has(key)) {
            this.registry.set(key, []);
        }

        return this.registry.get(key);
    }

    add(key: symbol, target: any) {
        this.get(key).push(target);
    }

    remove(key: symbol) {
        this.registry.delete(key);
    }
}

export const registry = new Registry();