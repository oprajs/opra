import type { DataType, DataTypeBase } from './data-type.interface.js';

export interface EnumType extends DataTypeBase {
  base?: DataType.Name | EnumType;
  values: Record<EnumType.Key, EnumType.Value>;
  meanings?: Record<EnumType.Key, string>;
}

export type EnumObject = Record<EnumType.Key, EnumType.Value>;
export type EnumArray = readonly (string | number)[];
export type EnumThunk = EnumObject | EnumArray;

export namespace EnumType {
  export const Kind = 'EnumType';
  export type Kind = typeof Kind;
  export type Value = string | number;
  export type Key = string;
}
