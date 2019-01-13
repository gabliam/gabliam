import {
  Args,
  GraphqlController,
  Mutation,
  Query,
  Subscription,
} from '@gabliam/graphql-core';
import { Connection, Repository } from '@gabliam/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Hero } from '../entities/hero';

const pubSub = new PubSub();

@GraphqlController({
  graphqlFiles: [`./hero/schema.gql`, `./hero/hero.gql`],
})
export class HeroController {
  private heroRepository: Repository<Hero>;

  constructor(connection: Connection) {
    this.heroRepository = connection.getRepository<Hero>('Hero');
  }

  @Mutation()
  async submitHero(@Args('heroInput') heroInput: Hero) {
    const hero = await this.heroRepository.save(heroInput);
    pubSub.publish('heroAdded', { heroAdded: { ...hero } });
    return hero;
  }

  @Subscription()
  heroAdded() {
    return () => pubSub.asyncIterator('heroAdded');
  }

  @Query()
  async heroes() {
    const photos = await this.heroRepository.find();
    if (photos.length > 0) {
      return photos;
    }
    return [];
  }

  @Query()
  async getPageOfHeroes(
    @Args('sortField') sortField: keyof Hero | undefined,
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
