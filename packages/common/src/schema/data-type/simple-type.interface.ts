import { Type } from 'ts-gems';
import type { DataType, DataTypeBase } from './data-type.interface.js';

export interface SimpleType extends DataTypeBase {
  ctor?: Type;
  base?: DataType.Name | SimpleType;
  codec?: SimpleType.Codec;
}

export namespace SimpleType {
  export const Kind = 'SimpleType';
  export type Kind = 'SimpleType';

  export interface Codec {
    decode?: (v: any) => any;
    encode?: (v: any) => any;
    coerce?: (v: any) => any;
    validate?: (v: any) => void;
  }
}
