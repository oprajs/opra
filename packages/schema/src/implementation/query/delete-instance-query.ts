import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';
import { EntityType } from '../data-type/entity-type.js';
import { EntityResource } from '../resource/entity-resource.js';

export type DeleteInstanceQueryOptions = StrictOmit<OpraSchema.DeleteInstanceQuery,
    'method' | 'scope' | 'operation' | 'resource' | 'keyValue'>;

export class OpraDeleteInstanceQuery implements StrictOmit<OpraSchema.DeleteInstanceQuery, 'resource'> {
  readonly kind = 'DeleteInstanceQuery';
  readonly method = 'delete'
  readonly scope = 'instance';
  readonly operation = 'delete';
  keyValue: OpraSchema.KeyValue;

  constructor(readonly resource: EntityResource,
              keyValue: any,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              options?: DeleteInstanceQueryOptions
  ) {
    this.keyValue = resource.dataType.getFieldType(resource.dataType.primaryKey).parse(keyValue);
  }

  get dataType(): EntityType {
    return this.resource.dataType;
  }
}
