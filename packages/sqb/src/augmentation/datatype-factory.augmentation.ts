import {
  classes,
  cloneObject,
  ComplexType,
  DocumentElement,
  OpraSchema,
} from '@opra/common';
import {
  DataType as SqbDataType,
  EntityMetadata,
  isAssociationField,
  isColumnField,
} from '@sqb/connect';
import type { Maybe } from 'ts-gems';
import DataTypeFactory = classes.DataTypeFactory;

const _prepareComplexTypeArgs = (DataTypeFactory as any)
  ._prepareComplexTypeArgs;
(DataTypeFactory as any)._prepareComplexTypeArgs = async function (
  context: DataTypeFactory.Context,
  owner: DocumentElement,
  initArgs: DataTypeFactory.ComplexTypeInit,
  metadata: ComplexType.Metadata | OpraSchema.ComplexType,
) {
  let sqbMeta: Maybe<EntityMetadata>;
  if (
    initArgs.ctor &&
    metadata.fields &&
    (sqbMeta = EntityMetadata.get(initArgs.ctor))
  ) {
    metadata = cloneObject(metadata);

    for (const [fieldName, fieldSchema] of Object.entries(metadata.fields!)) {
      const sqbField = sqbMeta && EntityMetadata.getField(sqbMeta, fieldName);
      if (!sqbField) continue;
      /** Copy type information from sqb metadata to opra */
      if (!fieldSchema.type || fieldSchema.type === Object) {
        if (isAssociationField(sqbField)) {
          if (!fieldSchema.type) {
            const trg = await sqbField.association.resolveTarget();
            if (trg?.ctor) fieldSchema.type = trg.ctor;
          }
        } else if (isColumnField(sqbField)) {
          fieldSchema.type = sqbField.enum || sqbField.type;
        }
      }

      if (isColumnField(sqbField)) {
        const hasNoType = !fieldSchema.type || fieldSchema.type === Object;
        switch (sqbField.dataType) {
          case SqbDataType.INTEGER:
          case SqbDataType.SMALLINT:
            if (hasNoType || fieldSchema.type === Number)
              fieldSchema.type = 'integer';
            break;
          case SqbDataType.GUID:
            if (hasNoType || fieldSchema.type === String)
              fieldSchema.type = 'uuid';
            break;
          case SqbDataType.DATE:
            if (fieldSchema.type === String) fieldSchema.type = 'datestring';
            else if (hasNoType || fieldSchema.type === Date)
              fieldSchema.type = 'date';
            break;
          case SqbDataType.TIMESTAMP:
            if (fieldSchema.type === String)
              fieldSchema.type = 'datetimestring';
            else if (hasNoType || fieldSchema.type === Date)
              fieldSchema.type = 'datetime';
            break;
          case SqbDataType.TIMESTAMPTZ:
            if (fieldSchema.type === Date) fieldSchema.type = 'datetime';
            else if (hasNoType || fieldSchema.type === String)
              fieldSchema.type = 'datetimestring';
            break;
          case SqbDataType.TIME:
            if (hasNoType || fieldSchema.type === String)
              fieldSchema.type = 'time';
            break;
          default:
            break;
        }
      }

      if (isAssociationField(sqbField)) {
        if (sqbField.association.returnsMany()) fieldSchema.isArray = true;
        if (!Object.prototype.hasOwnProperty.call(fieldSchema, 'exclusive'))
          fieldSchema.exclusive = true;
      }
      if (
        !Object.prototype.hasOwnProperty.call(fieldSchema, 'exclusive') &&
        Object.prototype.hasOwnProperty.call(sqbField, 'exclusive')
      ) {
        fieldSchema.exclusive = sqbField.exclusive;
      }
    }
  }
  return _prepareComplexTypeArgs.apply(DataTypeFactory, [
    context,
    owner,
    initArgs,
    metadata,
  ]);
};
