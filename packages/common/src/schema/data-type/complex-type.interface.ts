import { Type } from 'ts-gems';
import type { DataType, DataTypeBase } from './data-type.interface.js';
import type { MappedType } from './mapped-type.interface.js';
import type { UnionType } from './union-type.interface.js';

export interface ComplexType extends DataTypeBase {
  ctor?: Type;
  base?: DataType.Name | ComplexType | UnionType | MappedType;
  abstract?: boolean;
  elements?: Record<ComplexType.Element.name, ComplexType.Element | DataType.Name>;
  additionalElements?: boolean;// | string | Pick<Field, 'type' | 'format' | 'isArray' | 'enum'>;
}

export namespace ComplexType {
  export const Kind = 'ComplexType';
  export type Kind = 'ComplexType';
  export namespace Element {
    export type name = string;
    export type qualifiedName = string; // a.b.c
  }

  export type Element = {
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
     * If true, this Element will not be included in results by default.
     * The client side should include the Element name in the "include" query parameter.
     */
    exclusive?: boolean;

    // rules
    // nullable?: boolean;
    // readOnly?: boolean;
    // writeOnly?: boolean;
    // required?: boolean;
  }

}
