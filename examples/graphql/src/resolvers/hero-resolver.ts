import { GabResolver } from '@gabliam/graphql-core';
import { Connection, Repository } from '@gabliam/typeorm';
import {
  Arg,
  Mutation,
  Publisher,
  PubSub,
  Query,
  Root,
  Subscription,
} from 'type-graphql';
import { Hero } from '../entities/hero';
import { HeroInput } from './types/hero-input';
import { PaginatedHero } from './types/paginated-hero';

@GabResolver((of) => Hero)
export class HeroResolver {
  private heroRepository: Repository<Hero>;

  constructor(connection: Connection) {
    this.heroRepository = connection.getRepository<Hero>('Hero');
  }

  @Mutation((returns) => Hero)
  async submitHero(
    @PubSub('heroAdded') publish: Publisher<Hero>,
    @Arg('heroInput') heroInput: HeroInput,
  ) {
    const hero = await this.heroRepository.save(heroInput);
    await publish(hero);
    return hero;
  }

  @Query((returns) => [Hero])
  async heroes() {
    const photos = await this.heroRepository.find();
    if (photos.length > 0) {
      return photos;
    }
    return [];
  }

  @Subscription({ topics: 'heroAdded' })
  heroAdded(@Root() hero: Hero): Hero {
    return hero;
  }

  @Query((returns) => PaginatedHero)
  async getPageOfHeroes(
    @Arg('sortField', (type) => String, { nullable: true })
    sortField: keyof Hero | undefined,
    @Arg('sortOrder', (type) => String, { nullable: true })
    sortOrder: 'ASC' | 'DESC' | undefined,
    @Arg('page', { defaultValue: 0 }) page: number,
    @Arg('perPage', { defaultValue: 10 }) perPage: number,
  ): Promise<PaginatedHero> {
    if (page < 0) {
      page = 0;
    }
    if (perPage < 1) {
      perPage = 1;
    }
    const qb = this.heroRepository
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
