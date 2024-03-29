import { Field, InputType, Int } from '@gabliam/graphql-core';
import { Photo } from '../../entities/photo';

@InputType()
export class PhotoInput implements Partial<Photo> {
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
