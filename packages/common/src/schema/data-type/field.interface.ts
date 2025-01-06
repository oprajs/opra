import type { DataType } from './data-type.interface.js';

export namespace Field {
  export type Name = string;
  export type QualifiedName = string; // a.b.c
}

export type Field = {
  type?: DataType.Name | DataType;

  /**
   * Defines the description of the field
   */
  description?: string;

  /**
   * Defines the default value of the field
   */
  default?: any;

  /**
   * Indicates the fixed value of the field. The value of the field can not be any other value.
   */
  fixed?: any;

  /**
   * Indicates if field value required in create operation
   */
  required?: boolean;

  /**
   * Indicates if the field is readonly
   */
  readonly?: boolean;

  /**
   * Indicates if the field is writeonly
   */
  writeonly?: boolean;

  /**
   * If true, this Field will not be included in results by default.
   * The client side should include the Field name in the "include" query parameter.
   */
  exclusive?: boolean;

  /**
   * Indicates if the field value is an array
   */
  isArray?: boolean;

  /**
   * Indicates key field when this field is a ComplexType array
   */
  keyField?: string;

  /**
   * If true, this Field is a candidate for localization
   */
  localization?: boolean;

  /**
   * Defines example values for the field
   */
  examples?: any[] | Record<string, any>;

  /**
   * Indicates if the field is deprecated and can be removed in the next
   */
  deprecated?: boolean | string;
};
