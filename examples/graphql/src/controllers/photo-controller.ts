import {
  GraphqlController,
  QueryResolver,
  GraphQLFieldResolver,
  MutationResolver,
  Resolver,
  GraphQLMapFieldResolver
} from '@gabliam/graphql-core';
import { Photo } from '../entities/photo';
import { Connection, Repository } from '@gabliam/typeorm';
import * as _ from 'lodash';

@GraphqlController({
  graphqlFiles: [`./photo/schema.gql`, `./photo/photo.gql`]
})
export class PhotoController {
  private photoRepository: Repository<Photo>;

  constructor(connection: Connection) {
    this.photoRepository = connection.getRepository<Photo>('Photo');
  }

  @Resolver({
    path: 'Photo'
  })
  photoResolver(): GraphQLMapFieldResolver {
    return {
      id(value: any, args: any, context: any) {
        console.log('id here', value);
        return value.id;
      },
      name: _.property('name'),
      description: _.property('name'),
      fileName: _.property('fileName'),
      views: _.property('views'),
      isPublished: _.property('isPublished')
    };
  }

  @MutationResolver()
  submitPhoto(): GraphQLFieldResolver<any, any> {
    return async (obj, { photoInput }, context, info) => {
      return await this.photoRepository.save(photoInput);
    };
  }

  @QueryResolver()
  photos(): GraphQLFieldResolver<any, any> {
    return async (obj, args, context, info) => {
      const photos = await this.photoRepository.find();
      if (photos.length > 0) {
        return photos;
      }
      return [];
    };
  }

  @QueryResolver()
  getPageOfPhotos(): GraphQLFieldResolver<any, any> {
    return async (
      obj,
      { page = 0, perPage = 10, sortField, sortOrder, filter },
      context,
      info
    ) => {
      if (page < 0) {
        page = 0;
      }
      if (perPage < 1) {
        perPage = 1;
      }
      const qb = this.photoRepository
        .createQueryBuilder('p')
        .offset(page * perPage)
        .limit(perPage);

      if (sortField && sortOrder) {
        qb.addOrderBy(sortField, sortOrder);
      }

      const [items, totalCount] = await qb.getManyAndCount();

      return {
        items,
        totalCount
      };
    };
  }
}
