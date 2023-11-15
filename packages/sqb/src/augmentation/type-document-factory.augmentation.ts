import { Type } from 'ts-gems';
import { DATATYPE_METADATA, OpraSchema, TypeDocumentFactory } from "@opra/common";
import { DataType as SqbDataType, EntityMetadata, isAssociationField } from '@sqb/connect';

// @ts-ignore
const _prepareDataTypeInitArguments = TypeDocumentFactory.prototype.prepareDataTypeInitArguments;
// @ts-ignore
TypeDocumentFactory.prototype.prepareDataTypeInitArguments = async function (
    this: TypeDocumentFactory,
    schema: TypeDocumentFactory.DataTypeInitializer | OpraSchema.DataType,
    ctor?: Type
) {
  if (ctor && schema.kind === 'ComplexType' && schema.fields) {
    const sqbMeta = EntityMetadata.get(ctor);
    for (const [fieldName, fieldSchema] of Object.entries(schema.fields)) {
      const sqbField = sqbMeta && EntityMetadata.getField(sqbMeta, fieldName);
      if (!sqbField)
        continue;
      const detectType = !fieldSchema.type;
      if (isAssociationField(sqbField)) {
        if (!fieldSchema.type) {
          const trg = await sqbField.association.resolveTarget();
          if (trg) {
            fieldSchema.type = await this.importDataType(trg.ctor);
          }
        }
      } else if (sqbField.kind === 'column') {
        if (typeof sqbField.enum === 'object')
          fieldSchema.enum = sqbField.enum as any;
        if (fieldSchema.required == null && sqbField.notNull)
          fieldSchema.required = true;

        if (sqbField.type && Reflect.hasMetadata(DATATYPE_METADATA, sqbField.type)) {
          fieldSchema.type = sqbField.type as any;
        }
        switch (sqbField.dataType) {
          case SqbDataType.GUID:
            if (!fieldSchema.type || (detectType && fieldSchema.type === 'string'))
              fieldSchema.type = 'uuid';
            break;
          case SqbDataType.JSON:
            if (!fieldSchema.type || (detectType && fieldSchema.type === 'any'))
              fieldSchema.type = 'object';
            break;
          case SqbDataType.INTEGER:
          case SqbDataType.SMALLINT:
            if (!fieldSchema.type || (detectType && fieldSchema.type === 'number'))
              fieldSchema.type = 'integer';
            break;
          case SqbDataType.BIGINT:
            if (!fieldSchema.type || (detectType && fieldSchema.type === 'number'))
              fieldSchema.type = 'bigint';
            break;
          case SqbDataType.DATE:
            if (!fieldSchema.type || (detectType && (fieldSchema.type === 'datetime' || fieldSchema.type === 'string')))
              fieldSchema.type = 'date';
            break;
          case SqbDataType.TIMESTAMPTZ:
            if (!fieldSchema.type || (detectType && (fieldSchema.type === 'datetime' || fieldSchema.type === 'string')))
              fieldSchema.type = 'timestamptz';
            break;
          case SqbDataType.TIME:
            if (!fieldSchema.type || (detectType && (fieldSchema.type === 'datetime' || fieldSchema.type === 'string')))
              fieldSchema.type = 'time';
            break;
          case SqbDataType.BINARY:
            if (!fieldSchema.type || (detectType && fieldSchema.type === 'string'))
              fieldSchema.type = 'base64';
            break;
        }

        if (!fieldSchema.type) {
          switch (sqbField.dataType) {
            case SqbDataType.BOOL:
              fieldSchema.type = 'boolean';
              break;
            case SqbDataType.CHAR:
            case SqbDataType.VARCHAR:
            case SqbDataType.TEXT:
              fieldSchema.type = 'string';
              break;
            case SqbDataType.FLOAT:
            case SqbDataType.DOUBLE:
            case SqbDataType.NUMBER:
              fieldSchema.type = 'number';
              break;
            case SqbDataType.TIMESTAMP:
              fieldSchema.type = 'datetime';
              break;
          }
        }
        if (sqbField.notNull && fieldSchema.required === undefined)
          fieldSchema.required = sqbField.notNull;
        if (sqbField.exclusive && fieldSchema.exclusive === undefined)
          fieldSchema.exclusive = sqbField.exclusive;
        if (sqbField.default !== undefined && fieldSchema.default === undefined)
          fieldSchema.default = sqbField.default;
      }
      if (sqbField.exclusive && fieldSchema.exclusive === undefined)
        fieldSchema.exclusive = sqbField.exclusive;
    }
  }
  return await _prepareDataTypeInitArguments.call(this, schema, ctor);
}
