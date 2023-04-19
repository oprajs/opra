import type { Field } from 'src/schema/data-type/field.interface.js';
import type { DataType, DataTypeBase } from './data-type.interface.js';

export interface MappedType extends DataTypeBase {
  type: DataType.Name | DataType;
  omit?: Field.Name[];
  pick?: Field.Name[];
}

export namespace MappedType {
  export const Kind = 'MappedType';
  export type Kind = 'MappedType';
}
