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
