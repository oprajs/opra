import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';
import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import { EntityType } from '../data-type/entity-type.js';
import { EntityResource } from '../resource/entity-resource.js';

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

  constructor(readonly resource: EntityResource,
              keyValue: any,
              public data: any,
              options?: UpdateInstanceQueryOptions
  ) {
    this.keyValue = resource.dataType.getFieldType(resource.dataType.primaryKey).parse(keyValue);
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
