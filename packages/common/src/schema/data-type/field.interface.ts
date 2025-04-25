import type { DataType } from './data-type.interface.js';

export namespace Field {
  export type Name = string;
  export type QualifiedName = string;
}

/**
 * Represents a Field type used to define properties and behaviors of a data structure.
 *
 * The `Field` type allows describing the characteristics, constraints, and metadata of a field within an entity or data type.
 */
export type Field = {
  type?: DataType.Name | DataType;

  /**
   * Defines the label of the field. Mostly used for UI.
   */
  label?: string;

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
   * A boolean variable that indicates whether the value represents an array or not.
   * If true, the value is recognized as an array.
   * If false, the value is not an array.
   * This property is optional and may be undefined.
   */
  isArray?: boolean;

  /**
   * Determines whether the field is a nested entity within a parent structure.
   * If set to true, the field is considered to be part of a hierarchical or
   * composite structure. If false or undefined, the field is considered
   * standalone or root-level.
   */
  isNestedEntity?: boolean;

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
