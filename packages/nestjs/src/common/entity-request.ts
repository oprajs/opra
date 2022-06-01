import _ from 'underscore';
import {Type} from '@nestjs/common';
import {OpraURL} from '@opra/url';

export class CollectionRequest {

  constructor(readonly url: OpraURL,
              readonly entity: Type) {
  }

  get collection(): string {
    const p = this.url.path.get(0);
    return p ? p.resource : '';
  }

  get filter(): object | null {
    return this.url.searchParams.get('_filter');
  }

  get limit(): number | null {
    return this.url.searchParams.get('_limit');
  }

  get skip(): number | null {
    return this.url.searchParams.get('_skip');
  }

  get elements(): string[] | null {
    const s = this.url.searchParams.get('_elements')
    return s ? (Array.isArray(s) ? s : [s]): null;
  }

  get exclude(): string[] | null {
    const s = this.url.searchParams.get('_exclude')
    return s ? (Array.isArray(s) ? s : [s]): null;
  }

  get include(): string[] | null {
    const s = this.url.searchParams.get('_include')
    return s ? (Array.isArray(s) ? s : [s]) : null;
  }

  get distinct(): boolean | null {
    return this.url.searchParams.get('_distinct');
  }

  get total(): boolean | null {
    return this.url.searchParams.get('_total');
  }

  toJSON() {
    return _.reject({
      scope: 'Collection',
      url: '' + this.url,
      collection: this.collection,
      filter: this.filter,
      limit: this.limit,
      skip: this.skip,
      elements: this.elements,
      exclude: this.exclude,
      include: this.include,
      distinct: this.distinct,
      total: this.total
    }, _.isNull);
  }

}
