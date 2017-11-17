import * as _ from 'lodash';
import * as assert from 'assert';

export class Paginate<T> {
  private array: T[];

  private offset: number;

  private limit: number;

  private sort: string;

  private order: 'ASC' | 'DESC' = 'ASC';

  constructor(array: T[]) {
    assert(Array.isArray(array), 'must be an array');
    this.array = array;
  }

  setOffset(offset: number) {
    this.offset = offset;
    return this;
  }

  setLimit(limit: number) {
    this.limit = limit;
    return this;
  }

  addOrderBy(sort: string, order: 'ASC' | 'DESC' = 'ASC') {
    this.sort = sort;
    this.order = order;
    return this;
  }

  get() {
    if (this.array.length === 0) {
      return [];
    }

    let final = this.array;
    if (this.sort) {
      final = _.sortBy(final, this.sort);
      if (this.order === 'DESC') {
        final = final.reverse();
      }
    }

    return final.slice(this.offset, this.limit);
  }
}
