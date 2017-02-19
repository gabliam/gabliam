"use strict";
class Registry {
    constructor() {
        this.registry = new Map();
    }
    get(key) {
        if (!this.registry.has(key)) {
            this.registry.set(key, []);
        }
        return this.registry.get(key);
    }
    add(key, target) {
        this.get(key).push(target);
    }
    remove(key) {
        this.registry.delete(key);
    }
}
exports.Registry = Registry;
exports.registry = new Registry();
