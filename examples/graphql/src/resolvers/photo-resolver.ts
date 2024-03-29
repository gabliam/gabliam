import { DataSource, Repository } from 'typeorm';
import {
  GabResolver,
  Arg,
  Mutation,
  Publisher,
  PubSub,
  Query,
  Root,
  Subscription,
} from '@gabliam/graphql-core';
import { Photo } from '../entities/photo';
import { PaginatedPhoto } from './types/paginated-photo';
import { PhotoInput } from './types/photo-input';

@GabResolver((of) => Photo)
export class PhotoResolver {
  private photoRepository: Repository<Photo>;

  constructor(dataSource: DataSource) {
    this.photoRepository = dataSource.getRepository<Photo>('Photo');
  }

  @Subscription({ topics: 'photoAdded' })
  photoAdded(@Root() photo: Photo): Photo {
    return photo;
  }

  @Mutation((returns) => Photo)
  async submitPhoto(
    @PubSub('photoAdded') publish: Publisher<Photo>,
    @Arg('photoInput') photoInput: PhotoInput,
  ) {
    const photo = await this.photoRepository.save(photoInput);
    await publish(photo);

    return photo;
  }

  @Query((returns) => [Photo])
  async photos() {
    const photos = await this.photoRepository.find();
    if (photos.length > 0) {
      return photos;
    }
    return [];
  }

  @Query((returns) => PaginatedPhoto)
  async getPageOfPhotos(
    @Arg('sortField', (type) => String, { nullable: true })
    sortField: keyof Photo | undefined,
    @Arg('sortOrder', (type) => String, { nullable: true })
    sortOrder: 'ASC' | 'DESC' | undefined,
    @Arg('page', { defaultValue: 0 }) page: number,
    @Arg('perPage', { defaultValue: 10 }) perPage: number,
  ): Promise<PaginatedPhoto> {
    if (page < 0) {
      // eslint-disable-next-line no-param-reassign
      page = 0;
    }
    if (perPage < 1) {
      // eslint-disable-next-line no-param-reassign
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
      totalCount,
    };
  }
}
