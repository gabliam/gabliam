import { IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class Params {
  @IsNumber()
  id: string;
}

export class Params2 {
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsString()
  @Transform(
    value => (typeof value === 'string' ? value.toUpperCase() : value),
    { toClassOnly: true }
  )
  name: string;
}
