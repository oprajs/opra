import type { StrictOmit } from 'ts-gems';
import type { ComplexType } from './complex-type.interface.js';
import type { DataType, DataTypeBase } from './data-type.interface.js';
import type { Field } from './field.interface.js';
import type { MixinType } from './mixin-type.interface.js';

export interface MappedType extends StrictOmit<DataTypeBase, 'kind'> {
  kind: MappedType.Kind;
  base: DataType.Name | ComplexType | MixinType | MappedType;
  omit?: Field.Name[];
  pick?: Field.Name[];
  partial?: Field.Name[] | boolean;
  required?: Field.Name[] | boolean;
  discriminatorField?: string;
  discriminatorValue?: string;
}

export namespace MappedType {
  export const Kind = 'MappedType';
  export type Kind = typeof Kind;
}
