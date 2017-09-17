import {
  GraphqlController,
  QueryResolver,
  MutationResolver
} from '../../../src/decorator';
import { Hero } from './interfaces';
import { Paginate } from './array-util';
import { HeroSchema } from './schemas/schema';
import { GraphQLFieldResolver } from '../../../src/index';

@GraphqlController({
  schema: [HeroSchema]
})
export class HeroController {
  public heroRepository: Hero[] = [
    { id: 1, name: 'spiderman', power: 'spider', amountPeopleSaved: 10 },
    {
      id: 2,
      name: 'Wolverine',
      power: 'Superhuman senses',
      amountPeopleSaved: 100
    }
  ];

  private nextId = this.heroRepository.length + 2;

  @MutationResolver()
  submitHero(): GraphQLFieldResolver<any, any> {
    return async (obj, { heroInput }, context, info) => {
      const hero = {
        id: this.nextId++,
        ...heroInput
      };

      this.heroRepository.push(hero);
      return hero;
    };
  }

  @QueryResolver({
    schema: `type Query {
      heroes: [Hero]
    }`
  })
  heroes(): GraphQLFieldResolver<any, any> {
    return async (obj, args, context, info) => {
      return this.heroRepository;
    };
  }

  @QueryResolver({
    graphqlFile: './schemas/getPageOfHeroes.gql'
  })
  getPageOfHeroes(): GraphQLFieldResolver<any, any> {
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

      const items = new Paginate(this.heroRepository)
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
