import { Type } from 'ts-gems';
import { COMPLEXTYPE_FIELDS, DATATYPE_METADATA, MAPPED_TYPE_METADATA } from '../constants.js';
import { builtinClassMap } from '../helpers/internal-types.js';
import { ComplexTypeMetadata, FieldMetadata } from '../interfaces/metadata/data-type.metadata.js';
import { isConstructor } from './class.utils.js';
import { cloneObject } from './clone-object.util.js';

export function extractComplexTypeMetadata(ctor: Type | Function): ComplexTypeMetadata {
  const metadata = Reflect.getMetadata(DATATYPE_METADATA, ctor);
  if (!metadata)
    throw new TypeError(`Class "${ctor}" doesn't have  datatype metadata information`);

  const out: ComplexTypeMetadata = cloneObject(metadata);
  out.ctor = ctor as Type;

  const mappedTypeMetadata: any[] = Reflect.getMetadata(MAPPED_TYPE_METADATA, ctor);
  if (mappedTypeMetadata) {
    out.extends = [...mappedTypeMetadata.map(x => cloneObject(x))];
  }

  const fields: Record<string, FieldMetadata> = Reflect.getMetadata(COMPLEXTYPE_FIELDS, ctor);
  if (fields) {
    out.fields = cloneObject(fields);
    for (const prop of Object.values(out.fields)) {
      if (isConstructor(prop.type) && builtinClassMap.has(prop.type)) {
        prop.type = builtinClassMap.get(prop.type);
      }
    }
  }

  return out;
}
