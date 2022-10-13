import { StrictOmit } from 'ts-gems';
import { Expression, parseFilter } from '@opra/url';
import { OpraSchema } from '../../opra-schema.js';
import { EntityResource } from '../resource/entity-resource.js';

export type UpdateCollectionQueryOptions = StrictOmit<OpraSchema.UpdateCollectionQuery,
    'method' | 'scope' | 'operation' | 'resource' | 'data'>;

export class OpraUpdateCollectionQuery implements StrictOmit<OpraSchema.UpdateCollectionQuery, 'resource'> {
  readonly kind = 'UpdateCollectionQuery';
  readonly method = 'updateMany'
  readonly scope = 'collection';
  readonly operation = 'update';
  filter?: Expression;

  constructor(readonly resource: EntityResource,
              public data: {},
              options?: UpdateCollectionQueryOptions
  ) {
    this.filter = typeof options?.filter === 'string' ? parseFilter(options.filter) : options?.filter;
  }

  get dataType() {
    return this.resource.dataType;
  }
}
