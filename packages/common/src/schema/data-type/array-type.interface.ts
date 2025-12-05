import type { StrictOmit } from 'ts-gems';
import type { DataType, DataTypeBase } from './data-type.interface.js';

/**
 *
 * @interface ArrayType
 */
export interface ArrayType extends StrictOmit<DataTypeBase, 'kind'> {
  kind: ArrayType.Kind;
  type?: DataType.Name | DataType;
  minOccurs?: number;
  maxOccurs?: number;
}

export namespace ArrayType {
  export const Kind = 'ArrayType';
  export type Kind = 'ArrayType';
}
