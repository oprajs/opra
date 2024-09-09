import type { StrictOmit } from 'ts-gems';
import type { DataType, DataTypeBase } from './data-type.interface.js';

export interface EnumType extends StrictOmit<DataTypeBase, 'kind'> {
  kind: EnumType.Kind;
  base?: DataType.Name;
  attributes: Record<string | number, EnumType.ValueInfo>;
}

export namespace EnumType {
  export const Kind = 'EnumType';
  export type Kind = typeof Kind;

  export interface ValueInfo {
    alias?: string;
    description?: string;
  }
}
