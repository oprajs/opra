import type { StrictOmit } from 'ts-gems';
import type { Attribute } from './attribute.interface.js';
import type { DataType, DataTypeBase } from './data-type.interface.js';

export interface SimpleType extends StrictOmit<DataTypeBase, 'kind'> {
  kind: SimpleType.Kind;
  base?: DataType.Name;
  attributes?: Record<string, Attribute>;
}

export namespace SimpleType {
  export const Kind = 'SimpleType';
  export type Kind = 'SimpleType';
}
