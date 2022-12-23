import { Expression, parseFilter } from '../../../filter/index.js';
import { CollectionResourceInfo } from '../resource/collection-resource-info.js';

export type CollectionDeleteManyQueryOptions = {
  filter?: string | Expression;
}

export class CollectionDeleteManyQuery {
  readonly kind = 'CollectionDeleteManyQuery';
  readonly method = 'deleteMany'
  readonly operation = 'delete';
  filter?: Expression;

  constructor(readonly resource: CollectionResourceInfo,
              options?: CollectionDeleteManyQueryOptions
  ) {
    this.filter = typeof options?.filter === 'string' ? parseFilter(options.filter) : options?.filter;
  }

  get dataType() {
    return this.resource.dataType;
  }
}
