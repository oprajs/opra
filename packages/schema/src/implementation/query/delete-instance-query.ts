import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';
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
    if (resource.keyFields.length > 1) {
      if (typeof keyValue !== 'object')
        throw new Error(`You must provide an key/value object for all key fields (${resource.keyFields})`);
      resource.keyFields.reduce((o, k) => {
        o[k] = keyValue[k];
        return o;
      }, {});
    } else
      this.keyValue = resource.dataType.getFieldType(resource.keyFields[0]).parse(keyValue);
  }

  get dataType() {
    return this.resource.dataType;
  }
}
