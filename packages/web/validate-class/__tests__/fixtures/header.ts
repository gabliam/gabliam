import { Contains, IsNumber } from 'class-validator';

export class Header {
  @Contains('xml')
  accept: string;
}

export class Header2 {
  @Contains('json')
  accept: string;

  @IsNumber()
  id = 12;

  'secret-header' = '@@@@@@';
}
