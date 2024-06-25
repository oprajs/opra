import type { StrictOmit } from 'ts-gems';
import type { DataType, DataTypeBase } from './data-type.interface.js';

/**
 *
 * @interface SimpleType
 */
export interface SimpleType extends StrictOmit<DataTypeBase, 'kind'> {
  kind: SimpleType.Kind;
  base?: DataType.Name;
  attributes?: Record<string, Attribute>;
  properties?: Record<string, any>;
  /**
   * Naming alternatives across software languages
   */
  nameMappings?: Record<string, string>;
}

export namespace SimpleType {
  export const Kind = 'SimpleType';
  export type Kind = 'SimpleType';
}

/**
 *
 * @interface Attribute
 */
export interface Attribute {
  /**
   * Data format of the attribute
   */
  format?: string;

  /**
   * Defines the description of the attribute
   */
  description?: string;

  /**
   * Defines the description of the attribute
   */
  default?: any;

  /**
   * Indicates if the attribute is sealed or not. A sealed attribute cannot be extended/modified through inheritance.
   */
  sealed?: boolean;

  /**
   * Indicates if the attribute is deprecated and can be removed in the next
   */
  deprecated?: boolean | string;
}
