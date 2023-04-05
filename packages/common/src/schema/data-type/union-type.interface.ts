import type { ComplexType } from './complex-type.interface.js';
import type { DataType, DataTypeBase } from './data-type.interface.js';
import type { MappedType } from './mapped-type.interface.js';

export namespace UnionType {
  export const Kind = 'UnionType';
  export type Kind = 'UnionType';
}

export interface UnionType extends DataTypeBase {
  types: (DataType.Name | ComplexType | UnionType | MappedType)[];
}
