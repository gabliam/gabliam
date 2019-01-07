import { makeParamDecorator } from '@gabliam/core';
import { GraphQLResolveInfo } from 'graphql';
import { get } from 'lodash';
import { METADATA_KEY, PARAMETER_TYPE } from '../constants';

/**
 * Represent the handler for extract the parameter
 *
 * argsDecorator : Arguments passed to decorator
 * type of parameters (ex @Query('nb) nb: number, type = Number)
 */
export type HandlerFn = <V>(
  argsDecorator: any,
  type: string | undefined,
  parent: any,
  args: any,
  context: any,
  info: GraphQLResolveInfo
) => any;

export interface GqlParamDecorator<T = any> {
  handler: HandlerFn;

  args: T[];

  type: string;
}

/**
 * Function for create you own param decorator
 * @usageNotes
 *
 * You must passed a type and the handler
 * Type is mandatory, this param is used for introspection of parameters
 *
 * Sample to extract the user in query
 * file: photo.gql
 * ```graphql
 * type Photo {
 *   id: Int!
 *
 *   name: String!
 *
 *   description: String!
 *
 *   fileName: String!
 *
 *   views: Int!
 *
 *   isPublished: Boolean!
 * }
 *
 * input PhotoInput {
 *   name: String!
 *
 *   description: String!
 *
 *   fileName: String!
 *
 *   views: Int!
 *
 *   isPublished: Boolean!
 * }
 *
 * type Mutation {
 *   submitPhoto(photoInput: PhotoInput!): Photo
 * }
 * ```
 *
 * ```typescript
 *  const Photo = makeGqlParamDecorator('photo', (args, parent, { photoInput }) => photo)
 *
 * @GraphqlController({
 *   graphqlFiles: [`photo.gql`],
 * })
 * export class PhotoController {
 *   private photoRepository: Repository<Photo>;
 *
 *   constructor(connection: Connection) {
 *     this.photoRepository = connection.getRepository<Photo>('Photo');
 *   }
 *
 *   @Mutation()
 *   async submitPhoto(@Photo() photoInput: Photo) {
 *     return await this.photoRepository.save(photoInput);
 *   }
 * }
 * ```
 */
export const makeGqlParamDecorator = (type: string, handler: HandlerFn) => {
  return makeParamDecorator(
    METADATA_KEY.controllerParameter,
    (...args: any[]): GqlParamDecorator => ({ args, handler, type })
  );
};

/**
 * Type of the `Context` decorator / constructor function.
 */
export interface ContextDecorator {
  /**
   * Decorator that marks a parameter to inject Context
   *
   * @usageNotes
   * You can supply an optional path to extract a part of Context.
   * Under the hood, use lodash.get
   *
   * Example with full Context
   *
   * ```typescript
   * @GraphqlController({
   *   graphqlFiles: [`photo.gql`],
   * })
   * export class PhotoController {
   *   private photoRepository: Repository<Photo>;
   *
   *   constructor(connection: Connection) {
   *     this.photoRepository = connection.getRepository<Photo>('Photo');
   *   }
   *
   *   @Query()
   *   async photos(@Context() ctx: any) {
   *     const photos = await this.photoRepository.find();
   *     if (photos.length > 0) {
   *       return photos;
   *     }
   *     return [];
   *   }
   * }
   * ```
   *
   * Example with part of Context
   *
   * ```typescript
   * @GraphqlController({
   *   graphqlFiles: [`photo.gql`],
   * })
   * export class PhotoController {
   *   private photoRepository: Repository<Photo>;
   *
   *   constructor(connection: Connection) {
   *     this.photoRepository = connection.getRepository<Photo>('Photo');
   *   }
   *
   *   @Query()
   *   async photos(@Context('user') user: User) {
   *     const photos = await this.photoRepository.find();
   *     if (photos.length > 0) {
   *       return photos;
   *     }
   *     return [];
   *   }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@Context` decorator.
   */
  new (path?: string): any;
}

export const Context: ContextDecorator = makeGqlParamDecorator(
  PARAMETER_TYPE.CONTEXT,
  ([path]: [string | undefined], type, parent, args, ctx) => {
    if (path) {
      return get(ctx, path);
    }
    return ctx;
  }
);

/**
 * Type of the `Parent` decorator / constructor function.
 */
export interface ParentDecorator {
  /**
   * Decorator that marks a parameter to inject Parent
   *
   * @usageNotes
   * You can supply an optional path to extract a part of Parent.
   * Under the hood, use lodash.get
   *
   * Example with full Parent
   *
   * ```typescript
   * @GraphqlController({
   *   graphqlFiles: [`photo.gql`],
   * })
   * export class PhotoController {
   *   private photoRepository: Repository<Photo>;
   *
   *   constructor(connection: Connection) {
   *     this.photoRepository = connection.getRepository<Photo>('Photo');
   *   }
   *
   *   @Query()
   *   async photos(@Parent() ctx: any) {
   *     const photos = await this.photoRepository.find();
   *     if (photos.length > 0) {
   *       return photos;
   *     }
   *     return [];
   *   }
   * }
   * ```
   *
   * Example with part of Parent
   *
   * ```typescript
   * @GraphqlController({
   *   graphqlFiles: [`photo.gql`],
   * })
   * export class PhotoController {
   *   private photoRepository: Repository<Photo>;
   *
   *   constructor(connection: Connection) {
   *     this.photoRepository = connection.getRepository<Photo>('Photo');
   *   }
   *
   *   @Query()
   *   async photos(@Parent('user') user: User) {
   *     const photos = await this.photoRepository.find();
   *     if (photos.length > 0) {
   *       return photos;
   *     }
   *     return [];
   *   }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@Parent` decorator.
   */
  new (path?: string): any;
}

export const Parent: ParentDecorator = makeGqlParamDecorator(
  PARAMETER_TYPE.PARENT,
  ([path]: [string | undefined], type, parent) => {
    if (path) {
      return get(parent, path);
    }
    return parent;
  }
);

/**
 * Type of the `Args` decorator / constructor function.
 */
export interface ArgsDecorator {
  /**
   * Decorator that marks a parameter to inject Args
   *
   * @usageNotes
   * You can supply an optional path to extract a part of Args.
   * Under the hood, use lodash.get
   *
   * Example with full Args
   *
   * ```typescript
   * @GraphqlController({
   *   graphqlFiles: [`photo.gql`],
   * })
   * export class PhotoController {
   *   private photoRepository: Repository<Photo>;
   *
   *   constructor(connection: Connection) {
   *     this.photoRepository = connection.getRepository<Photo>('Photo');
   *   }
   *
   *   @Query()
   *   async photos(@Args() ctx: any) {
   *     const photos = await this.photoRepository.find();
   *     if (photos.length > 0) {
   *       return photos;
   *     }
   *     return [];
   *   }
   * }
   * ```
   *
   * Example with part of Args
   *
   * ```typescript
   * @GraphqlController({
   *   graphqlFiles: [`photo.gql`],
   * })
   * export class PhotoController {
   *   private photoRepository: Repository<Photo>;
   *
   *   constructor(connection: Connection) {
   *     this.photoRepository = connection.getRepository<Photo>('Photo');
   *   }
   *
   *   @Query()
   *   async photos(@Args('user') user: User) {
   *     const photos = await this.photoRepository.find();
   *     if (photos.length > 0) {
   *       return photos;
   *     }
   *     return [];
   *   }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@Args` decorator.
   */
  new (path?: string): any;
}

export const Args: ArgsDecorator = makeGqlParamDecorator(
  PARAMETER_TYPE.ARGS,
  ([path]: [string | undefined], type, parent, args) => {
    if (path) {
      return get(args, path);
    }
    return args;
  }
);

/**
 * Type of the `Info` decorator / constructor function.
 */
export interface InfoDecorator {
  /**
   * Decorator that marks a parameter to inject Info
   *
   * @usageNotes
   * You can supply an optional path to extract a part of Info.
   * Under the hood, use lodash.get
   *
   * Example with full Info
   *
   * ```typescript
   * @GraphqlController({
   *   graphqlFiles: [`photo.gql`],
   * })
   * export class PhotoController {
   *   private photoRepository: Repository<Photo>;
   *
   *   constructor(connection: Connection) {
   *     this.photoRepository = connection.getRepository<Photo>('Photo');
   *   }
   *
   *   @Query()
   *   async photos(@Info() ctx: any) {
   *     const photos = await this.photoRepository.find();
   *     if (photos.length > 0) {
   *       return photos;
   *     }
   *     return [];
   *   }
   * }
   * ```
   *
   * Example with part of Info
   *
   * ```typescript
   * @GraphqlController({
   *   graphqlFiles: [`photo.gql`],
   * })
   * export class PhotoController {
   *   private photoRepository: Repository<Photo>;
   *
   *   constructor(connection: Connection) {
   *     this.photoRepository = connection.getRepository<Photo>('Photo');
   *   }
   *
   *   @Query()
   *   async photos(@Info('user') user: User) {
   *     const photos = await this.photoRepository.find();
   *     if (photos.length > 0) {
   *       return photos;
   *     }
   *     return [];
   *   }
   * }
   * ```
   */
  (path?: string): ParameterDecorator;

  /**
   * see the `@Info` decorator.
   */
  new (path?: string): any;
}

export const Info: InfoDecorator = makeGqlParamDecorator(
  PARAMETER_TYPE.INFO,
  ([path]: [string | undefined], type, parent, args, context, info) => {
    if (path) {
      return get(info, path);
    }
    return info;
  }
);
