import { Type } from 'ts-gems';
import { COMPLEXTYPE_FIELDS, DATATYPE_METADATA, MAPPED_TYPE_METADATA } from '../../constants.js';
import {
  ComplexTypeMetadata,
  FieldMetadata, SimpleTypeMetadata,
} from '../../interfaces/data-type.metadata.js';
import { OpraSchema } from '../../opra-schema.definition.js';
import { Named } from '../../types.js';
import { cloneObject } from '../../utils/clone-object.util.js';
import { primitiveClasses } from '../data-type/builtin-data-types.js';

const optionalsSymbol = Symbol.for('opra.optional-lib.sqb-connect');

export async function extractDataTypeSchema(ctor: Type | Function): Promise<Named<OpraSchema.DataType>> {
  const metadata = Reflect.getMetadata(DATATYPE_METADATA, ctor);
  if (!metadata)
    throw new TypeError(`Class "${ctor}" doesn't have "DataType" metadata information`);
  if (OpraSchema.isComplexType(metadata))
    return await extractComplexTypeSchema(ctor as Type, metadata as ComplexTypeMetadata);
  if (OpraSchema.isSimpleType(metadata))
    return await extractSimpleTypeSchema(ctor as Type, metadata as SimpleTypeMetadata);
  throw new TypeError(`Invalid DataType metadata`);
}

async function extractSimpleTypeSchema(ctor: Type, metadata: SimpleTypeMetadata): Promise<Named<OpraSchema.SimpleType>> {
  const out: SimpleTypeMetadata = cloneObject(metadata);
  out.ctor = ctor;
  return out as any;
}

async function extractComplexTypeSchema(ctor: Type, metadata: ComplexTypeMetadata): Promise<Named<OpraSchema.ComplexType>> {

  const out: ComplexTypeMetadata = cloneObject(metadata);
  out.ctor = ctor;

  const mappedTypeMetadata: any[] = Reflect.getMetadata(MAPPED_TYPE_METADATA, ctor);
  if (mappedTypeMetadata) {
    out.extends = [...mappedTypeMetadata.map(x => cloneObject(x))];
  }

  const fields: Record<string, FieldMetadata> = Reflect.getMetadata(COMPLEXTYPE_FIELDS, ctor);
  if (fields) {
    out.fields = cloneObject(fields);
    for (const [fieldName, field] of Object.entries(out.fields)) {
      if (typeof field.type === 'function') {
        const type = primitiveClasses.get(field.type);
        if (type) field.type = type;
      }
      const SqbConnect = globalThis[optionalsSymbol]?.SqbConnect;
      let sqbField;
      if (SqbConnect) {
        const {EntityMetadata, isAssociationField} = SqbConnect;
        const meta = EntityMetadata.get(ctor);
        sqbField = meta && EntityMetadata.getField(meta, fieldName);
        if (sqbField) {
          if (field.type === Function || field.type === 'object' ||
              field.type === Object || field.type === 'any') {
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

      if (sqbField && sqbField.kind === 'column') {
        const DataType = SqbConnect.DataType;
        if (field.type === 'number' || field.type === Number) {
          switch (sqbField.dataType) {
            case DataType.INTEGER:
            case DataType.SMALLINT:
              field.type = 'integer';
              break;
            case DataType.BIGINT:
              field.type = 'bigint';
              break;
          }
        } else if (field.type === 'string' || field.type === String) {
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
  return out as any;
}
