import { Field, ID, Int, ObjectType } from '@gabliam/graphql-core';

@ObjectType()
export class Hero {
  @Field(type => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  power: string;

  @Field(type => Int, { defaultValue: 0 })
  amountPeopleSaved = 0;
}
