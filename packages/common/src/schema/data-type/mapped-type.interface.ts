import type { ComplexType } from './complex-type.interface.js';
import type { DataType, DataTypeBase } from './data-type.interface.js';

export interface MappedType extends DataTypeBase {
  type: DataType.Name | DataType;
  omit?: ComplexType.Element.name[];
  pick?: ComplexType.Element.name[];
}

export namespace MappedType {
  export const Kind = 'MappedType';
  export type Kind = 'MappedType';
}
