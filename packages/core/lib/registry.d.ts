export declare class Registry {
    private registry;
    get<T>(key: symbol): T[];
    add(key: symbol, target: any): void;
    remove(key: symbol): void;
}
export declare const registry: Registry;
