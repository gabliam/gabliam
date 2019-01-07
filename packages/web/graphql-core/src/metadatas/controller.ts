import { injectable, makeDecorator, Register } from '@gabliam/core';
import * as caller from 'caller';
import * as path from 'path';
import { METADATA_KEY, TYPE } from '../constants';
import { absoluteGraphqlFiles } from './utils';

/**
 * GraphqlControllerOptions
 */
export interface GraphqlControllerOptions {
  schema?: string[];
  graphqlFiles?: string[];
  pwd?: string;
}

/**
 * Type of the `GraphqlController` decorator / constructor function.
 */
export interface GraphqlControllerDecorator {
  /**
   * Decorator that marks a class as an Gabliam GraphqlController and provides configuration
   * metadata that determines how the config should be processed,
   * instantiated.
   *
   * @usageNotes
   *
   * you can supply a list of schema
   * you can supply a list of graphql files. Path can be absolute or relative.
   * if you use relative path, use pwd options or the dir of the current controller
   *
   * ```typescript
   *
   * @GraphqlController({
   *  graphqlFiles: [`./hero/schema.gql`, `./hero/hero.gql`],
   * })
   * export class HeroController {
   *  private heroRepository: Repository<Hero>;
   *
   *  constructor(connection: Connection) {
   *    this.heroRepository = connection.getRepository<Hero>('Hero');
   *  }
   *
   *  @MutationResolver()
   *  async submitHero(@Args('heroInput') heroInput: Hero) {
   *   return await this.heroRepository.save(heroInput);
   *  }
   *}
   * ```
   */
  (options?: GraphqlControllerOptions): ClassDecorator;

  /**
   * see the `@GraphqlController` decorator.
   */
  new (options?: GraphqlControllerOptions): any;
}

/**
 * `GraphqlController` decorator and metadata.
 */
export interface GraphqlController {
  schema: string[];

  graphqlFiles: string[];
}

export const GraphqlController: GraphqlControllerDecorator = makeDecorator(
  METADATA_KEY.controller,
  (
    { schema = [], graphqlFiles = [], pwd }: GraphqlControllerOptions = {
      schema: [],
      graphqlFiles: [],
    }
  ): GraphqlController => {
    if (!pwd) {
      pwd = path.dirname(caller(4));
    }
    if (graphqlFiles) {
      graphqlFiles = absoluteGraphqlFiles(graphqlFiles, pwd);
    }
    return { schema, graphqlFiles };
  },
  cls => {
    injectable()(cls);
    Register({ type: TYPE.Controller, id: cls })(cls);
  }
);
