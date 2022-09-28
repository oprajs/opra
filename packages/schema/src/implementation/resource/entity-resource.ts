import { OpraSchema } from '../../interfaces/opra-schema.interface.js';
import { EntityType } from '../data-type/entity-type.js';
import { OpraService } from '../opra-service.js';
import { BaseResource } from './base-resource.js';

export class EntityResource extends BaseResource {
  declare readonly metadata: OpraSchema.EntityResource;
  readonly dataType: EntityType;

  constructor(
      service: OpraService,
      dataType: EntityType,
      metadata: OpraSchema.EntityResource
  ) {
    if (dataType.kind !== 'EntityType')
      throw new TypeError(`You should provide an EntityType for EntityController`);
    super(service, metadata);
    this.dataType = dataType;
  }

  getSchema(jsonOnly?: boolean): OpraSchema.EntityResource {
    const out = super.getSchema(jsonOnly) as OpraSchema.EntityResource;
    if (out.methods) {
      for (const k of Object.keys(out.methods)) {
        if (typeof out.methods[k] === 'object' && !Object.keys(out.methods[k]).length)
          out.methods[k] = true;
      }
    }
    return out;
  }

}
