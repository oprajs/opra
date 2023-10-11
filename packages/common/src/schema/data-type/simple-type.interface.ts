import { StrictOmit } from 'ts-gems';
import * as vg from 'valgen';
import type { DataTypeBase } from './data-type.interface.js';
import { DataType } from './data-type.interface.js';

export interface SimpleType extends StrictOmit<DataTypeBase, 'kind'> {
  kind: SimpleType.Kind;
  base?: DataType.Name | SimpleType;
  decoder?: vg.Validator;
  encoder?: vg.Validator;
}

export namespace SimpleType {
  export const Kind = 'SimpleType';
  export type Kind = 'SimpleType';
}
