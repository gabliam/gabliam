import { ClassType, ObjectType, Field, Int } from 'type-graphql';

export type IPaginatedResponseConstruct<TItem> = new () => IPaginatedResponse<
  TItem
>;

export interface IPaginatedResponse<TItem> {
  items: TItem[];

  totalCount: number;
}

export default function PaginatedResponse<TItem>(
  TItemClass: ClassType<TItem>
): IPaginatedResponseConstruct<TItem> {
  @ObjectType({ isAbstract: true })
  class PaginatedResponseClass implements IPaginatedResponse<TItem> {
    // here we use the runtime argument
    @Field(type => [TItemClass])
    // and here the generic type
    items: TItem[];

    @Field(type => Int)
    totalCount: number;
  }
  return PaginatedResponseClass;
}
