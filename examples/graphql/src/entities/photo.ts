import { Column, Entity, PrimaryGeneratedColumn } from '@gabliam/typeorm';
import { Field, ID, Int, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class Photo {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Field()
  @Column({
    length: 500,
  })
  name: string;

  @Field()
  @Column('text')
  description: string;

  @Field()
  @Column()
  fileName: string;

  @Field(type => Int)
  @Column('int')
  views: number;

  @Field()
  @Column()
  isPublished: boolean;
}
