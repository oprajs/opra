import { Expression, parseFilter } from '../../../filter/index.js';
import { CollectionResourceInfo } from '../resource/collection-resource-info.js';

export type CollectionUpdateManyQueryOptions = {
  filter?: string | Expression;
}

export class CollectionUpdateManyQuery {
  readonly kind = 'CollectionUpdateManyQuery';
  readonly method = 'updateMany'
  readonly operation = 'update';
  filter?: Expression;

  constructor(readonly resource: CollectionResourceInfo,
              public data: {},
              options?: CollectionUpdateManyQueryOptions
  ) {
    this.filter = typeof options?.filter === 'string' ? parseFilter(options.filter) : options?.filter;
  }

  get dataType() {
    return this.resource.dataType;
  }
}
