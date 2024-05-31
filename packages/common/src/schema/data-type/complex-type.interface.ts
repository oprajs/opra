import { StrictOmit, Type } from 'ts-gems';
import type { DataType, DataTypeBase } from './data-type.interface.js';
import type { Field } from './field.interface.js';
import type { MappedType } from './mapped-type.interface.js';
import type { MixinType } from './mixin-type.interface.js';

export interface ComplexType extends StrictOmit<DataTypeBase, 'kind'> {
  kind: ComplexType.Kind;
  base?: DataType.Name | ComplexType | MixinType | MappedType;
  ctor?: Type;
  fields?: Record<Field.Name, Field | DataType.Name>;
  additionalFields?: boolean | string | DataType | ['error'] | ['error', string];
  keyField?: Field.Name;
}

export namespace ComplexType {
  export const Kind = 'ComplexType';
  export type Kind = typeof Kind;
}
