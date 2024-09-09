import type { StrictOmit } from 'ts-gems';
import type { ComplexType } from './complex-type.interface.js';
import type { DataType, DataTypeBase } from './data-type.interface.js';
import type { MappedType } from './mapped-type.interface.js';

export interface MixinType extends StrictOmit<DataTypeBase, 'kind'> {
  kind: MixinType.Kind;
  types: (DataType.Name | ComplexType | MixinType | MappedType)[];
}

export namespace MixinType {
  export const Kind = 'MixinType';
  export type Kind = 'MixinType';
}
