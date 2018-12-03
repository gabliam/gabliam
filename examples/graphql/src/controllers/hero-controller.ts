import {
  Args,
  GraphqlController,
  MutationResolver,
  QueryResolver,
} from '@gabliam/graphql-core';
import { Connection, Repository } from '@gabliam/typeorm';
import { Hero } from '../entities/hero';

@GraphqlController({
  graphqlFiles: [`./hero/schema.gql`, `./hero/hero.gql`],
})
export class HeroController {
  private heroRepository: Repository<Hero>;

  constructor(connection: Connection) {
    this.heroRepository = connection.getRepository<Hero>('Hero');
  }

  @MutationResolver()
  async submitHero(@Args('heroInput') heroInput: Hero) {
    console.log('submitHero', heroInput);
    return await this.heroRepository.save(heroInput);
  }

  @QueryResolver()
  async heroes() {
    const photos = await this.heroRepository.find();
    if (photos.length > 0) {
      return photos;
    }
    return [];
  }

  @QueryResolver()
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
