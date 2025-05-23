import type { ComplexType } from './complex-type.interface.js';
import type { EnumType } from './enum-type.interface.js';
import type { MappedType } from './mapped-type.interface.js';
import type { MixinType } from './mixin-type.interface.js';
import type { SimpleType } from './simple-type.interface.js';
import type { UnionType } from './union-type.interface.js';

export type DataType =
  | SimpleType
  | EnumType
  | ComplexType
  | MappedType
  | MixinType
  | UnionType;

export namespace DataType {
  export type Name = string;
  export type Kind =
    | ComplexType.Kind
    | EnumType.Kind
    | MappedType.Kind
    | SimpleType.Kind
    | MixinType.Kind
    | UnionType.Kind;
}

export interface DataTypeBase {
  kind: DataType.Kind;
  description?: string;
  examples?: DataTypeExample[];
  abstract?: boolean;
}

export interface DataTypeExample {
  description?: string;
  value?: any;
}
