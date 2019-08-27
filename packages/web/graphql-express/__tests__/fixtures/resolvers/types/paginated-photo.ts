import { Photo } from '../../entities/photo';
import PaginatedResponse from './paginated-reponse';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class PaginatedPhoto extends PaginatedResponse(Photo) {}
