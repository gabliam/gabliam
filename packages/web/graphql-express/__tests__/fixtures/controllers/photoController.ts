import {
  Args,
  GraphqlController,
  MapResolver,
  MutationResolver,
  QueryResolver,
} from '@gabliam/graphql-core';
import * as _ from 'lodash';
import { Paginate } from './array-util';
import { Photo } from './interfaces';

@GraphqlController({
  graphqlFiles: ['./schemas/photo.gql'],
})
export class PhotoController {
  public photoRepository: Photo[] = [
    {
      id: 1,
      description: '',
      fileName: 'cat.png',
      isPublished: true,
      name: 'cat',
      views: 0,
    },
    {
      id: 2,
      description: '',
      fileName: 'dog.png',
      isPublished: true,
      name: 'dog',
      views: 0,
    },
    {
      id: 3,
      description: '',
      fileName: 'fish.png',
      isPublished: true,
      name: 'fish',
      views: 0,
    },
  ];

  private nextId = this.photoRepository.length + 2;

  @MapResolver({
    path: 'Photo',
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
      isPublished: _.property('isPublished'),
    };
  }

  @MutationResolver()
  async submitPhoto(@Args('photoInput') photoInput: Photo) {
    const photo: Photo = {
      ...photoInput,
      id: this.nextId++,
    };
    this.photoRepository.push(photo);
  }

  @QueryResolver()
  async photos() {
    return this.photoRepository;
  }

  @QueryResolver()
  async getPageOfPhotos(
    @Args('sortField') sortField: keyof Photo | undefined,
    @Args('sortOrder') sortOrder: 'ASC' | 'DESC' | undefined,
    @Args('page') page = 0,
    @Args('perPage') perPage = 10
  ) {
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
      totalCount: items.length,
    };
  }
}
