import { Hero } from '../../entities/hero';
import PaginatedResponse from './paginated-reponse';
import { ObjectType } from '@gabliam/graphql-core';

@ObjectType()
export class PaginatedHero extends PaginatedResponse(Hero) {}
