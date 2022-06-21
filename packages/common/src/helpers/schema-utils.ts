import {SCHEMA_METADATA, SCHEMA_PROPERTIES, SCHEMA_PROPERTY} from '../constants';
import {Ctor} from '../types';
import {OpraSchema} from '../definition/schema-definition.interface';

export function extractSchemaDefinition(ctor: Ctor): OpraSchema | undefined {
  const schemaMetadata = Reflect.getMetadata(SCHEMA_METADATA, ctor);
  const properties = Reflect.getMetadata(SCHEMA_PROPERTIES, ctor.prototype);
  if (!(properties || schemaMetadata))
    return;
  const out = {
    ...schemaMetadata,
    properties: {}
  }
  if (properties) {
    for (const n of properties) {
      const p = Reflect.getMetadata(SCHEMA_PROPERTY, ctor.prototype, n);
      if (p) {
        out.properties[n] = {...p};
      }
    }
  }
  return out;
}
