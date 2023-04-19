import { Type } from 'ts-gems';
import { ComplexField } from './compex-field.interface.js';
import type { DataType, DataTypeBase } from './data-type.interface.js';
import type { MappedType } from './mapped-type.interface.js';
import type { UnionType } from './union-type.interface.js';

export interface ComplexType extends DataTypeBase {
  ctor?: Type;
  base?: DataType.Name | ComplexType | UnionType | MappedType;
  abstract?: boolean;
  fields?: Record<ComplexField.Name, ComplexField | DataType.Name>;
  additionalFields?: boolean;// | string | Pick<Field, 'type' | 'format' | 'isArray' | 'enum'>;
}

export namespace ComplexType {
  export const Kind = 'ComplexType';
  export type Kind = 'ComplexType';

}
