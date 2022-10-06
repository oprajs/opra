import { OpraSchema } from '../../opra-schema.js';
import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import { EntityType } from '../data-type/entity-type.js';
import { OpraService } from '../opra-service.js';
import { OpraResource } from './base-resource.js';

export class EntityResource extends OpraResource {
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
    if (metadata.methods.search && metadata.methods.search.sortFields) {
      metadata.methods.search.sortFields = normalizeFieldArray(service, dataType, metadata.methods.search.sortFields);
    }

  }

  get methods() {
    return this.metadata.methods;
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
