import { makePropDecorator } from '@gabliam/core';
import * as caller from 'caller';
import * as path from 'path';
import { METADATA_KEY } from '../constants';
import { absoluteGraphqlFile } from './utils';

export interface ResolverOptions {
  schema?: string;

  path?: string;

  graphqlFile?: string;

  pwd?: string;
}

export enum ResolverType {
  ResolveType = 'ResolveType',

  Map = 'Map',

  Query = 'Query',

  Mutation = 'Mutation',

  Subscription = 'Subscription',
}

/**
 * Controller method metadata.
 */
export interface Resolver {
  type: ResolverType;

  path: string;

  schema: string | undefined;

  graphqlFile: string | undefined;
}

const makeGqlMethodDecorator = (type: ResolverType) => {
  return makePropDecorator(
    METADATA_KEY.resolver,
    (resolverOptions: ResolverOptions = {}): Resolver => {
      const defaultPwd = path.dirname(caller(4));

      let resolverPath = '';
      if (resolverOptions.path) {
        resolverPath = resolverOptions.path;
      }

      let graphqlFile = resolverOptions.graphqlFile;
      if (graphqlFile) {
        const pwd = resolverOptions.pwd || defaultPwd;
        graphqlFile = absoluteGraphqlFile(graphqlFile, pwd);
      }

      return {
        type,
        path: resolverPath,
        schema: resolverOptions.schema,
        graphqlFile,
      };
    },
    (target, name, descriptor, annotationInstance: Resolver) => {
      let resolverPath = annotationInstance.path;
      if (resolverPath === '') {
        resolverPath = name;
      }
      switch (annotationInstance.type) {
        case ResolverType.Query:
        case ResolverType.Mutation:
          resolverPath = `${type}.${resolverPath}`;
          break;
        case ResolverType.Subscription:
          resolverPath = `${type}.${resolverPath}.subscribe`;
          break;
        case ResolverType.ResolveType:
          resolverPath = `${resolverPath}.__resolveType`;
          break;
        case ResolverType.Map:
        default:
          resolverPath = resolverPath;
      }
      annotationInstance.path = resolverPath;
    }
  );
};

/**
 * Type of the `GqlResolveType` decorator / constructor function.
 */
export interface GqlResolveTypeDecorator {
  /**
   * Decorator for add a resolve type
   * @see https://www.apollographql.com/docs/graphql-tools/resolvers.html#Unions-and-interfaces
   *
   * @usageNotes
   *
   * file: vehicle.gql
   * ```graphql
   *  interface Vehicle {
   *    maxSpeed: Int
   *  }
   *
   *  type Airplane implements Vehicle {
   *    maxSpeed: Int
   *    wingspan: Int
   *  }
   *
   *  type Car implements Vehicle {
   *    maxSpeed: Int
   *    licensePlate: String
   *  }
   * ```
   *
   * ```typescript
   * @GraphqlController({
   *  graphqlFiles: [`./vehicle.gql`],
   * })
   * class VehicleController {
   *    @GqlResolveType()
   *    Vehicle(obj, context, info) {
   *      if(obj.wingspan){
   *        return 'Airplane';
   *      }
   *
   *      if(obj.licensePlate){
   *        return 'Car';
   *      }
   *
   *      return null;
   *    }
   * }
   * ```
   */
  (options?: ResolverOptions): MethodDecorator;

  /**
   * see the `@GqlResolveType` decorator.
   */
  new (options?: ResolverOptions): any;
}

export const GqlResolveType: GqlResolveTypeDecorator = makeGqlMethodDecorator(
  ResolverType.ResolveType
);

/**
 * Type of the `ResolveMap` decorator / constructor function.
 */
export interface ResolveMapDecorator {
  /**
   * Decorator for add a resolve map
   * @see https://www.apollographql.com/docs/graphql-tools/resolvers.html#Resolver-map
   *
   * @usageNotes
   *
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
   * ```
   *
   * ```typescript
   * @GraphqlController({
   *   graphqlFiles: [`./photo.gql`],
   * })
   * export class PhotoController {
   *   private photoRepository: Repository<Photo>;
   *
   *   constructor(connection: Connection) {
   *     this.photoRepository = connection.getRepository<Photo>('Photo');
   *   }
   *
   *   @ResolveMap({
   *     path: 'Photo',
   *   })
   *   photoResolver() {
   *     return {
   *       id(value: any, args: any, context: any) {
   *         return value.id;
   *       },
   *       name: _.property('name'),
   *       description: _.property('name'),
   *       fileName: _.property('fileName'),
   *       views: _.property('views'),
   *       isPublished: _.property('isPublished'),
   *     };
   *   }
   * }
   * ```
   */
  (options?: ResolverOptions): MethodDecorator;

  /**
   * see the `@ResolveMap` decorator.
   */
  new (options?: ResolverOptions): any;
}

export const ResolveMap: ResolveMapDecorator = makeGqlMethodDecorator(
  ResolverType.Map
);

/**
 * Type of the `Query` decorator / constructor function.
 */
export interface QueryDecorator {
  /**
   * Decorator for add a query resolver
   * @see https://www.apollographql.com/docs/graphql-tools/resolvers.html#Resolver-obj-argument
   *
   * @usageNotes
   *
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
   * extend type Query {
   *   photos: [Photo]
   * }
   * ```
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
   *   async photos() {
   *     const photos = await this.photoRepository.find();
   *     if (photos.length > 0) {
   *       return photos;
   *     }
   *     return [];
   *   }
   * }
   * ```
   */
  (options?: ResolverOptions): MethodDecorator;

  /**
   * see the `@Query` decorator.
   */
  new (options?: ResolverOptions): any;
}

export const Query: QueryDecorator = makeGqlMethodDecorator(ResolverType.Query);

/**
 * Type of the `Mutation` decorator / constructor function.
 */
export interface MutationDecorator {
  /**
   * Decorator for add a Mutation resolver
   * @see https://www.apollographql.com/docs/apollo-server/schemas/types.html#Mutation-type
   *
   * @usageNotes
   *
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
   *   async submitPhoto(@Args('photoInput') photoInput: Photo) {
   *     return await this.photoRepository.save(photoInput);
   *   }
   * }
   * ```
   */
  (options?: ResolverOptions): MethodDecorator;

  /**
   * see the `@Mutation` decorator.
   */
  new (options?: ResolverOptions): any;
}

export const Mutation: MutationDecorator = makeGqlMethodDecorator(
  ResolverType.Mutation
);

/**
 * Type of the `Subscription` decorator / constructor function.
 */
export interface SubscriptionDecorator {
  /**
   * Decorator for add a Subscription resolver
   * @see https://www.apollographql.com/docs/apollo-server/schemas/types.html#Subscription-type
   *
   * @usageNotes
   *
   * file: schema.gql
   * ```graphql
   * type Channel {
   *   id: ID!                # "!" denotes a required field
   *   name: String
   *   messages: [Message]!
   * }
   *
   * input MessageInput {
   *   channelId: ID!
   *   text: String
   * }
   *
   * type Message {
   *   id: ID!
   *   text: String
   * }
   *
   * # The mutation root type, used to define all mutations
   * type Mutation {
   *   addMessage(message: MessageInput!): Message
   * }
   * # The subscription root type, specifying what we can subscribe to
   * type Subscription {
   *   messageAdded(channelId: ID!): Message
   * }
   * ```
   *
   * ```typescript
   * const channels = [
   *   {
   *     id: "1",
   *     name: "soccer",
   *     messages: [
   *       {
   *         id: "1",
   *         text: "soccer is football"
   *       },
   *       {
   *         id: "2",
   *         text: "hello soccer world cup"
   *       }
   *     ]
   *   }
   * ];
   *
   * const pubsub = new PubSub();
   *
   * @GraphqlController({
   *   graphqlFiles: [`./schema.gql`]
   * })
   * export class MessageController {
   *
   *   @Mutation()
   *   async addMessage(@Args("message") message: Message) {
   *     const channel = channels.find(channel => channel.id === message.channelId);
   *     if (!channel) throw new Error("Channel does not exist");
   *
   *     const newMessage = { id: String(nextMessageId++), text: message.text };
   *     channel.messages.push(newMessage);
   *
   *     pubsub.publish("messageAdded", {
   *       messageAdded: newMessage,
   *       channelId: message.channelId
   *     });
   *
   *     return newMessage;
   *   }
   *
   *   @Subscription()
   *   messageAdded() {
   *     return withFilter(
   *       () => pubsub.asyncIterator("messageAdded"),
   *       (payload, variables) => {
   *         // The `messageAdded` channel includes events for all channels, so we filter to only
   *         // pass through events for the channel specified in the query
   *         return payload.channelId === variables.channelId;
   *       }
   *     );
   *   }
   * }
   * ```
   */
  (options?: ResolverOptions): MethodDecorator;

  /**
   * see the `@Subscription` decorator.
   */
  new (options?: ResolverOptions): any;
}

export const Subscription: SubscriptionDecorator = makeGqlMethodDecorator(
  ResolverType.Subscription
);
