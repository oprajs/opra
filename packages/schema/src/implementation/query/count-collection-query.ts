import { StrictOmit } from 'ts-gems';
import { Expression, parseFilter } from '@opra/url';
import { OpraSchema } from '../../opra-schema.js';
import { CollectionResource } from '../resource/collection-resource.js';

export type CountCollectionQueryOptions = StrictOmit<OpraSchema.CountCollectionQuery,
    'method' | 'scope' | 'operation' | 'resource'>;

export class OpraCountCollectionQuery implements StrictOmit<OpraSchema.CountCollectionQuery, 'resource'> {
  readonly kind = 'CountCollectionQuery';
  readonly method = 'count'
  readonly scope = 'collection';
  readonly operation = 'read';
  filter?: Expression;

  constructor(readonly resource: CollectionResource,
              options?: CountCollectionQueryOptions
  ) {
    this.filter = typeof options?.filter === 'string' ? parseFilter(options.filter) : options?.filter;
  }

  get dataType() {
    return this.resource.dataType;
  }
}
