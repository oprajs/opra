import { StrictOmit } from 'ts-gems';
import type { ComplexType } from './complex-type.interface.js';
import type { DataType } from './data-type.interface.js';
import type { MappedType } from './mapped-type.interface.js';

export interface UnionType extends StrictOmit<ComplexType, 'kind'> {
  kind: UnionType.Kind;
  types: (DataType.Name | ComplexType | UnionType | MappedType)[];
}

export namespace UnionType {
  export const Kind = 'UnionType';
  export type Kind = 'UnionType';
}
