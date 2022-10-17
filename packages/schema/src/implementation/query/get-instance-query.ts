import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';
import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import { CollectionResource } from '../resource/collection-resource.js';
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

  constructor(readonly resource: CollectionResource,
              keyValue: any,
              options?: GetInstanceQueryOptions
  ) {
    if (resource.keyFields.length > 1) {
      if (typeof keyValue !== 'object')
        throw new Error(`You must provide an key/value object for all key fields (${resource.keyFields})`);
      resource.keyFields.reduce((o, k) => {
        o[k] = keyValue[k];
        return o;
      }, {});
    } else
      this.keyValue = resource.dataType.getFieldType(resource.keyFields[0]).parse(keyValue);
    this.nested = options?.nested;
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
