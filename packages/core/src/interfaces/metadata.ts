import { interfaces } from 'inversify';

export interface BeanMetadata {
    id: interfaces.ServiceIdentifier<any>;
    key: string;
    target: any;
}

export interface ValueMetadata {
    path: string;
    key: string;
    target: any;
}

export interface ValueRegistry {
    id: interfaces.ServiceIdentifier<any>;

    target: any;
}

export interface ConfigRegistry extends ValueRegistry {
    order: number;
}

export interface RegistryMetada {
    type: string|symbol;

    value: ValueRegistry;
}
