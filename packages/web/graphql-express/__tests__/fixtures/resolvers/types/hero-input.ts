import { Field, InputType, Int }  from '@gabliam/graphql-core';
import { Hero } from '../../entities/hero';

@InputType()
export class HeroInput implements Partial<Hero> {
  @Field()
  name: string;

  @Field()
  power: string;

  @Field(type => Int, { defaultValue: 0 })
  amountPeopleSaved = 0;
}
