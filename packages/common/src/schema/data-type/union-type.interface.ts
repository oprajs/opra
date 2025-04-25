import type { StrictOmit } from 'ts-gems';
import type { ComplexType } from './complex-type.interface.js';
import type { DataType, DataTypeBase } from './data-type.interface.js';
import type { MappedType } from './mapped-type.interface.js';
import type { MixinType } from './mixin-type.interface.js';
import type { SimpleType } from './simple-type.interface.js';

export interface UnionType extends StrictOmit<DataTypeBase, 'kind'> {
  kind: UnionType.Kind;
  types: (DataType.Name | ComplexType | MixinType | MappedType | SimpleType)[];
  discriminator?: string;
}

export namespace UnionType {
  export const Kind = 'UnionType';
  export type Kind = 'UnionType';
}
