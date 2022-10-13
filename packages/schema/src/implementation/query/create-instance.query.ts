import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';
import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import { EntityResource } from '../resource/entity-resource.js';

export type CreateInstanceQueryOptions = StrictOmit<OpraSchema.CreateInstanceQuery,
    'method' | 'scope' | 'operation' | 'resource' | 'data'>;

export class OpraCreateInstanceQuery implements StrictOmit<OpraSchema.CreateInstanceQuery, 'resource'> {
  readonly kind = 'CreateInstanceQuery';
  readonly method = 'create'
  readonly scope = 'collection';
  readonly operation = 'create';
  pick?: string[];
  omit?: string[];
  include?: string[];

  constructor(readonly resource: EntityResource,
              public data: {},
              options?: CreateInstanceQueryOptions
  ) {
    if (options?.pick)
      this.pick = normalizeFieldArray(resource.owner, resource.dataType, options.pick);
    if (options?.omit)
      this.omit = normalizeFieldArray(resource.owner, resource.dataType, options.omit);
    if (options?.include)
      this.include = normalizeFieldArray(resource.owner, resource.dataType, options.include);
  }

  get dataType() {
    return this.resource.dataType;
  }

}
