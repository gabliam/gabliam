import {
  Args,
  GraphqlController,
  MutationResolver,
  QueryResolver,
} from '@gabliam/graphql-core';
import { Paginate } from './array-util';
import { Hero } from './interfaces';
import { HeroSchema } from './schemas/schema';

@GraphqlController({
  schema: [HeroSchema],
})
export class HeroController {
  public heroRepository: Hero[] = [
    { id: 1, name: 'spiderman', power: 'spider', amountPeopleSaved: 10 },
    {
      id: 2,
      name: 'Wolverine',
      power: 'Superhuman senses',
      amountPeopleSaved: 100,
    },
  ];

  private nextId = this.heroRepository.length + 2;

  @MutationResolver()
  async submitHero(@Args('heroInput') heroInput: Hero) {
    const hero = {
      id: this.nextId++,
      ...heroInput,
    };

    this.heroRepository.push(hero);
    return hero;
  }

  @QueryResolver({
    schema: `type Query {
      heroes: [Hero]
    }`,
  })
  async heroes() {
    return this.heroRepository;
  }

  @QueryResolver({
    graphqlFile: './schemas/getPageOfHeroes.gql',
  })
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
    const start = (page + 1) * perPage;
    const end = start + perPage - 1;

    const items = new Paginate(this.heroRepository)
      .setOffset(start)
      .setLimit(end - start)
      .get();

    return {
      items,
      totalCount: items.length,
    };
  }
}
