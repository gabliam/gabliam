import {
  GraphqlController,
  QueryResolver,
  MutationResolver,
  Resolver
} from '../../../src/decorator';
import { Photo } from './interfaces';
import * as _ from 'lodash';
import { Paginate } from './array-util';
import { GraphQLFieldResolver } from '../../../src/index';

@GraphqlController({
  graphqlFiles: ['./schemas/photo.gql']
})
export class PhotoController {
  public photoRepository: Photo[] = [
    {
      id: 1,
      description: '',
      fileName: 'cat.png',
      isPublished: true,
      name: 'cat',
      views: 0
    },
    {
      id: 2,
      description: '',
      fileName: 'dog.png',
      isPublished: true,
      name: 'dog',
      views: 0
    },
    {
      id: 3,
      description: '',
      fileName: 'fish.png',
      isPublished: true,
      name: 'fish',
      views: 0
    }
  ];

  private nextId = this.photoRepository.length + 2;

  @Resolver({
    path: 'Photo'
  })
  photoResolver() {
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
      const photo: Photo = {
        ...photoInput,
        id: this.nextId++
      };
      this.photoRepository.push(photo);
    };
  }

  @QueryResolver()
  photos(): GraphQLFieldResolver<any, any> {
    return async (obj, args, context, info) => {
      return this.photoRepository;
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
      const start = (page + 1) * perPage;
      const end = start + perPage - 1;

      const items = new Paginate(this.photoRepository)
        .setOffset(start)
        .setLimit(end - start)
        .get();

      return {
        items,
        totalCount: items.length
      };
    };
  }
}
