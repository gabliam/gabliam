import {
  Arg,
  Mutation,
  Publisher,
  PubSub,
  Query,
  Resolver,
  Root,
  Subscription,
} from 'type-graphql';
import { Hero } from '../entities/hero';
import { Paginate } from './array-util';
import { HeroInput } from './types/hero-input';
import { PaginatedHero } from './types/paginated-hero';

@Resolver(of => Hero)
export class HeroResolver {
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

  @Mutation(returns => Hero)
  async submitHero(
    @PubSub('heroAdded') publish: Publisher<Hero>,
    @Arg('heroInput') heroInput: HeroInput
  ) {
    const hero: Hero = {
      id: this.nextId++,
      ...heroInput,
    };

    this.heroRepository.push(hero);
    await publish(hero);
    return hero;
  }

  @Query(returns => [Hero])
  async heroes() {
    const heroes = this.heroRepository;
    if (heroes.length > 0) {
      return heroes;
    }
    return [];
  }

  @Subscription({ topics: 'heroAdded' })
  heroAdded(@Root() hero: Hero): Hero {
    return hero;
  }

  @Query(returns => PaginatedHero)
  async getPageOfHeroes(
    @Arg('sortField', type => String, { nullable: true })
    sortField: keyof Hero | undefined,
    @Arg('sortOrder', type => String, { nullable: true })
    sortOrder: 'ASC' | 'DESC' | undefined,
    @Arg('page', { defaultValue: 0 }) page: number,
    @Arg('perPage', { defaultValue: 10 }) perPage: number
  ): Promise<PaginatedHero> {
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
