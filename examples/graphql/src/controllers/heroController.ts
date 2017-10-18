import {
  GraphqlController,
  QueryResolver,
  GraphQLFieldResolver,
  MutationResolver
} from '@gabliam/graphql';
import { Hero } from '../entities/hero';
import { Connection, Repository } from '@gabliam/typeorm';

@GraphqlController({
  graphqlFiles: [`${__dirname}/hero/schema.gql`, `${__dirname}/hero/hero.gql`]
})
export class HeroController {
  private heroRepository: Repository<Hero>;

  constructor(connection: Connection) {
    this.heroRepository = connection.getRepository<Hero>('Hero');
  }

  @MutationResolver()
  submitHero(): GraphQLFieldResolver<any, any> {
    return async (obj, { heroInput }, context, info) => {
      console.log('submitHero', heroInput);
      return await this.heroRepository.persist(heroInput);
    };
  }

  @QueryResolver()
  heroes(): GraphQLFieldResolver<any, any> {
    return async (obj, args, context, info) => {
      const photos = await this.heroRepository.find();
      if (photos.length > 0) {
        return photos;
      }
      return [];
    };
  }

  @QueryResolver()
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
      const qb = this.heroRepository
        .createQueryBuilder('p')
        .setOffset(page * perPage)
        .setLimit(perPage);

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
