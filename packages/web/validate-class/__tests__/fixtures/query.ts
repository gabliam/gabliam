import { Transform, Type } from 'class-transformer';
import { IsDate, IsInt, IsString } from 'class-validator';

export class Query {
  @IsDate()
  start: Date;
}

export class Query2 {
  @IsString()
  @Transform(
    value => (typeof value === 'string' ? value.toUpperCase() : value),
    { toClassOnly: true }
  )
  name: string;

  @IsInt()
  @Type(() => Number)
  page = 1;

  @IsInt()
  @Type(() => Number)
  id: number;
}
