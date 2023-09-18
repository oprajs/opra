import { Type } from 'ts-gems';
import type { DataType, DataTypeBase } from './data-type.interface.js';
import type { Field } from './field.interface.js';
import type { MappedType } from './mapped-type.interface.js';
import type { UnionType } from './union-type.interface.js';

export interface ComplexType extends DataTypeBase<ComplexType.Kind> {
  ctor?: Type;
  base?: DataType.Name | ComplexType | UnionType | MappedType;
  abstract?: boolean;
  fields?: Record<Field.Name, Field | DataType.Name>;
  additionalFields?: boolean | 'error';
}

export namespace ComplexType {
  export const Kind = 'ComplexType';
  export type Kind = 'ComplexType';

}
