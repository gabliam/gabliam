import { resolverType } from './interfaces';

export interface ControllerMetadata {
  schema: string[];

  graphqlFiles: string[];
}


export interface ResolverMetadata {
  type: resolverType | null;

  path: string;

  key: string;

  schema: string | undefined;

  graphqlFile: string | undefined;
}
