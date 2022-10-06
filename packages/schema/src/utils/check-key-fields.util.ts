import { EntityResource } from '../implementation/resource/entity-resource.js';
import { OpraSchema } from '../opra-schema.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function checkKeyFields(resource: EntityResource, key: OpraSchema.KeyValue) {
  if (!resource.dataType.primaryKey)
    throw new Error(`"${resource.name}" has no primary key`);
}
