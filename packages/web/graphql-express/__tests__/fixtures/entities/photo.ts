import { Field, ID, Int, ObjectType }  from '@gabliam/graphql-core';

@ObjectType()
export class Photo {
  @Field(type => ID)
  readonly id: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  fileName: string;

  @Field(type => Int)
  views: number;

  @Field()
  isPublished: boolean;
}
