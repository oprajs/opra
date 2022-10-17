import { Type } from 'ts-gems';
import * as Optionals from '@opra/optionals';
import { DataType } from '@sqb/builder';
import { COMPLEXTYPE_FIELDS, DATATYPE_METADATA, MAPPED_TYPE_METADATA } from '../constants.js';
import { builtinClassMap } from '../implementation/data-type/internal-data-types.js';
import { ComplexTypeMetadata, FieldMetadata } from '../interfaces/metadata/data-type.metadata.js';
import { isConstructor } from './class.utils.js';
import { cloneObject } from './clone-object.util.js';

export async function extractComplexTypeMetadata(ctor: Type | Function): Promise<ComplexTypeMetadata> {
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
    for (const [fieldName, field] of Object.entries(out.fields)) {
      let sqbField: Optionals.SqbConnect.AnyFieldMetadata | undefined;
      if (Optionals.SqbConnect) {
        const {EntityMetadata, isAssociationField} = Optionals.SqbConnect;
        const meta = EntityMetadata.get(ctor);
        sqbField = meta && EntityMetadata.getField(meta, fieldName);
        if (sqbField) {
          if (field.type === Function || field.type === Object || field.type === 'any') {
            field.type = 'any';
            if (isAssociationField(sqbField)) {
              if (!sqbField.association.returnsMany())
                delete field.isArray;
              const trg = await sqbField.association.resolveTarget();
              if (trg) {
                field.type = trg.ctor;
              }
            }
          }
          if (sqbField.exclusive && field.exclusive === undefined)
            field.exclusive = sqbField.exclusive;
        }
      }
      if (isConstructor(field.type)) {
        const t = builtinClassMap.get(field.type);
        if (t)
          field.type = t.name;
      }

      if (sqbField && sqbField.kind === 'column') {
        if (field.type === 'number') {
          switch (sqbField.dataType) {
            case DataType.INTEGER:
            case DataType.SMALLINT:
              field.type = 'integer';
              break;
            case DataType.BIGINT:
              field.type = 'bigint';
              break;
          }
        } else if (field.type === 'string') {
          switch (sqbField.dataType) {
            case DataType.GUID:
              field.type = 'guid';
              break;
          }
        }
        if (sqbField.notNull && field.required === undefined)
          field.required = sqbField.notNull;
        if (sqbField.exclusive && field.exclusive === undefined)
          field.exclusive = sqbField.exclusive;
        if (sqbField.default !== undefined && field.default === undefined)
          field.default = sqbField.default;
      }
    }
  }

  return out;
}
