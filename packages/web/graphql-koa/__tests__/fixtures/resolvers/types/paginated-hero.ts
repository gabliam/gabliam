import { Hero } from '../../entities/hero';
import PaginatedResponse from './paginated-reponse';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class PaginatedHero extends PaginatedResponse(Hero) {}
