import type { ComplexField } from './compex-field.interface.js';
import type { DataType, DataTypeBase } from './data-type.interface.js';

export interface MappedType extends DataTypeBase {
  type: DataType.Name | DataType;
  omit?: ComplexField.Name[];
  pick?: ComplexField.Name[];
}

export namespace MappedType {
  export const Kind = 'MappedType';
  export type Kind = 'MappedType';
}
