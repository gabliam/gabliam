import {
  GraphqlController,
  QueryResolver,
  GraphQLFieldResolver,
  MutationResolver
} from '@gabliam/graphql-core';
import { Hero } from '../entities/hero';
import { Connection, Repository } from '@gabliam/typeorm';

@GraphqlController({
  graphqlFiles: [`./hero/schema.gql`, `./hero/hero.gql`]
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
      return await this.heroRepository.save(heroInput);
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
