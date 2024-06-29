import { ComplexType, DataType, EnumType, MappedType, SimpleType } from '@opra/common';

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
