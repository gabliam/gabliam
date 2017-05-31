import { resolverType } from './interfaces';

export interface ControllerMetadata {
  schema: string[];
}


export interface ResolverMetadata {
  type: resolverType | null;

  path: string;

  key: string;

  schema: string | null
}
