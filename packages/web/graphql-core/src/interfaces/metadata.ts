import { ResolverType } from '../decorator';

export interface ControllerMetadata {
  schema: string[];

  graphqlFiles: string[];
}

export interface ResolverMetadata {
  type: ResolverType;

  path: string;

  key: string;

  schema: string | undefined;

  graphqlFile: string | undefined;
}
