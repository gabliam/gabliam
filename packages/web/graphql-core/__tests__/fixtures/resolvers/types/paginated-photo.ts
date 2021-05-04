import { ObjectType } from 'type-graphql';
import { Photo } from '../../entities/photo';
import PaginatedResponse from './paginated-reponse';

@ObjectType()
export class PaginatedPhoto extends PaginatedResponse(Photo) {}
