import type { DataType } from './data-type.interface.js';

export namespace Field {
  export type Name = string;
  export type QualifiedName = string; // a.b.c
}

export type Field = {
  type: DataType.Name | DataType;
  description?: string;
  isArray?: boolean;
  default?: any;
  required?: boolean;
  format?: string;
  fixed?: string | number;
  examples?: any[] | Record<string, any>;
  deprecated?: boolean | string;
  /**
   * If true, this Field will not be included in results by default.
   * The client side should include the Field name in the "include" query parameter.
   */
  exclusive?: boolean;

  // rules
  // nullable?: boolean;
  // readOnly?: boolean;
  // writeOnly?: boolean;
  // required?: boolean;
}
