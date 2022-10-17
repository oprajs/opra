import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';
import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import { CollectionResource } from '../resource/collection-resource.js';

export type UpdateInstanceQueryOptions = StrictOmit<OpraSchema.UpdateInstanceQuery,
    'method' | 'scope' | 'operation' | 'resource' | 'keyValue' | 'data'>;

export class OpraUpdateInstanceQuery implements StrictOmit<OpraSchema.UpdateInstanceQuery, 'resource'> {
  readonly kind = 'UpdateInstanceQuery';
  readonly method = 'update'
  readonly scope = 'instance';
  readonly operation = 'update';
  keyValue: OpraSchema.KeyValue;
  pick?: string[];
  omit?: string[];
  include?: string[];

  constructor(readonly resource: CollectionResource,
              keyValue: any,
              public data: any,
              options?: UpdateInstanceQueryOptions
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
