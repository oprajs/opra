import type { DataType, DataTypeBase } from './data-type.interface.js';
import { Field } from './field.interface.js';

export interface MappedType extends DataTypeBase<MappedType.Kind> {
  type: DataType.Name | DataType;
  omit?: Field.Name[];
  pick?: Field.Name[];
}

export namespace MappedType {
  export const Kind = 'MappedType';
  export type Kind = 'MappedType';
}
