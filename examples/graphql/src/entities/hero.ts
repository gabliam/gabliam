import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, Int, ObjectType } from '@gabliam/graphql-core';

@ObjectType()
@Entity()
export class Hero {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Field()
  @Column({
    length: 500,
  })
  name: string;

  @Field()
  @Column()
  power: string;

  @Field(type => Int, { defaultValue: 0 })
  @Column('int', { default: 0 })
  amountPeopleSaved = 0;
}
