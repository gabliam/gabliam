import { Photo } from '../../entities/photo';
import PaginatedResponse from './paginated-reponse';
import { ObjectType } from '@gabliam/graphql-core';

@ObjectType()
export class PaginatedPhoto extends PaginatedResponse(Photo) {}
