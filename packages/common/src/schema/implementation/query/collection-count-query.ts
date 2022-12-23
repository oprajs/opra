import { Expression, parseFilter } from '../../../filter/index.js';
import { CollectionResourceInfo } from '../resource/collection-resource-info.js';

export type CollectionCountQueryOptions = {
  filter?: string | Expression;
};

export class CollectionCountQuery {
  readonly kind = 'CollectionCountQuery';
  readonly method = 'count'
  readonly operation = 'read';
  filter?: Expression;

  constructor(readonly resource: CollectionResourceInfo,
              options?: CollectionCountQueryOptions
  ) {
    this.filter = typeof options?.filter === 'string' ? parseFilter(options.filter) : options?.filter;
  }

  get dataType() {
    return this.resource.dataType;
  }
}
