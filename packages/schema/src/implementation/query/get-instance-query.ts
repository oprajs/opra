import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';
import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import { EntityType } from '../data-type/entity-type.js';
import { EntityResource } from '../resource/entity-resource.js';
import { OpraGetFieldQuery } from './get-field-query.js';

export type GetInstanceQueryOptions = StrictOmit<OpraSchema.GetInstanceQuery,
    'method' | 'scope' | 'operation' | 'resource' | 'keyValue' | 'nested'> &
    {
      nested?: OpraGetFieldQuery;
    }

export class OpraGetInstanceQuery implements StrictOmit<OpraSchema.GetInstanceQuery, 'resource'> {
  readonly kind = 'GetInstanceQuery';
  readonly method = 'get'
  readonly scope = 'instance';
  readonly operation = 'read';
  keyValue: OpraSchema.KeyValue;
  pick?: string[];
  omit?: string[];
  include?: string[];
  nested?: OpraGetFieldQuery;

  constructor(readonly resource: EntityResource,
              keyValue: any,
              options?: GetInstanceQueryOptions
  ) {
    this.keyValue = resource.dataType.getFieldType(resource.dataType.primaryKey).parse(keyValue);
    this.nested = options?.nested;
    if (options?.pick)
      this.pick = normalizeFieldArray(resource.owner, resource.dataType, options.pick);
    if (options?.omit)
      this.omit = normalizeFieldArray(resource.owner, resource.dataType, options.omit);
    if (options?.include)
      this.include = normalizeFieldArray(resource.owner, resource.dataType, options.include);
  }

  get dataType(): EntityType {
    return this.resource.dataType;
  }
}
