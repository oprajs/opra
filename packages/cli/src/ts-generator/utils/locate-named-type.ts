import {
  ComplexType,
  DataType,
  EnumType,
  MappedType,
  SimpleType,
} from '@opra/common';

/**
 * Locates the first named type in the inheritance chain of a data type.
 *
 * @param type - The data type to start from.
 * @returns The found named DataType instance, or undefined if not found.
 */
export function locateNamedType(type?: DataType): DataType | undefined {
  if (!type) return;
  if (type.name) return type;
  if (
    type instanceof SimpleType ||
    type instanceof ComplexType ||
    type instanceof EnumType ||
    type instanceof MappedType
  ) {
    return locateNamedType(type.base);
  }
}
