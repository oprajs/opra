import { StrictOmit } from 'ts-gems';
import { Expression, parseFilter } from '@opra/url';
import { OpraSchema } from '../../opra-schema.js';
import { EntityResource } from '../resource/entity-resource.js';

export type DeleteCollectionQueryOption = StrictOmit<OpraSchema.DeleteCollectionQuery,
    'method' | 'scope' | 'operation' | 'resource'>;

export class OpraDeleteCollectionQuery implements StrictOmit<OpraSchema.DeleteCollectionQuery, 'resource'> {
  readonly kind = 'DeleteCollectionQuery';
  readonly method = 'deleteMany'
  readonly scope = 'collection';
  readonly operation = 'delete';
  filter?: Expression;

  constructor(readonly resource: EntityResource,
              options?: DeleteCollectionQueryOption
  ) {
    this.filter = typeof options?.filter === 'string' ? parseFilter(options.filter) : options?.filter;
  }

  get dataType() {
    return this.resource.dataType;
  }
}
