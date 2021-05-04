import { ObjectType } from 'type-graphql';
import { Hero } from '../../entities/hero';
import PaginatedResponse from './paginated-reponse';

@ObjectType()
export class PaginatedHero extends PaginatedResponse(Hero) {}
