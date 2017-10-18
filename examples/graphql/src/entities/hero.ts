import { Entity, Column, PrimaryGeneratedColumn } from '@gabliam/typeorm';

@Entity()
export class Hero {
  @PrimaryGeneratedColumn() id: number;

  @Column({
    length: 500
  })
  name: string;

  @Column() power: string;

  @Column('int', { default: 0 })
  amountPeopleSaved = 0;
}
