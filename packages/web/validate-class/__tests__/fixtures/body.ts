import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class Body {
  @IsString()
  first: string;

  @IsOptional()
  @IsString()
  last: string | undefined | null;

  @IsInt()
  role: number;
}

export class Body2 {
  @IsString()
  first: string;

  @IsOptional()
  @IsString()
  last = 'Smith';

  @IsString()
  @Transform(
    ({ value }) => (typeof value === 'string' ? value.toUpperCase() : value),
    { toClassOnly: true },
  )
  role: string;

  @IsOptional()
  @IsNumber()
  id = 42;
}
