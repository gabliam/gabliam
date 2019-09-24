import { Field, ID, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class Hero {
  @Field(type => ID)
  readonly id: number;

  @Field()
  name: string;

  @Field()
  power: string;

  @Field(type => Int, { defaultValue: 0 })
  amountPeopleSaved = 0;
}
