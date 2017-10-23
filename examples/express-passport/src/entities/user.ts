import { serialize } from 'cerialize';

export interface User {
  username: string;
  password: string;
}

export class UserSerialize {
  @serialize username: string;
  @serialize password: string;
}
