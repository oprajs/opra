import type { DataType, DataTypeBase } from './data-type.interface.js';

export interface EnumType extends DataTypeBase {
  base?: DataType.Name | EnumType;
  values: Record<EnumType.key, EnumType.value>;
  meanings?: Record<EnumType.key, string>;
}

export type EnumObject = Record<EnumType.key, EnumType.value>;
export type EnumArray = readonly (string | number)[];
export type EnumThunk = EnumObject | EnumArray;

export namespace EnumType {
  export const Kind = 'EnumType';
  export type Kind = typeof Kind;
  export type value = string | number;
  export type key = string;
}
