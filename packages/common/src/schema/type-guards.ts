import { ComplexType } from './data-type/complex-type.interface.js';
import type { DataType } from './data-type/data-type.interface.js';
import { EnumType } from './data-type/enum-type.interface.js';
import { MappedType } from './data-type/mapped-type.interface.js';
import { MixinType } from './data-type/mixin-type.interface.js';
import { SimpleType } from './data-type/simple-type.interface.js';
import { UnionType } from './data-type/union-type.interface.js';
import { HttpController } from './http/http-controller.interface.js';

export function isDataType(obj: any): obj is DataType {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj.kind === ComplexType.Kind ||
      obj.kind === EnumType.Kind ||
      obj.kind === MappedType.Kind ||
      obj.kind === SimpleType.Kind ||
      obj.kind === MixinType.Kind ||
      obj.kind === UnionType.Kind)
  );
}

export function isComplexType(obj: any): obj is ComplexType {
  return obj && typeof obj === 'object' && obj.kind === ComplexType.Kind;
}

export function isSimpleType(obj: any): obj is SimpleType {
  return obj && typeof obj === 'object' && obj.kind === SimpleType.Kind;
}

export function isMixinType(obj: any): obj is MixinType {
  return obj && typeof obj === 'object' && obj.kind === MixinType.Kind;
}

export function isMappedType(obj: any): obj is MappedType {
  return obj && typeof obj === 'object' && obj.kind === MappedType.Kind;
}

export function isEnumType(obj: any): obj is EnumType {
  return obj && typeof obj === 'object' && obj.kind === EnumType.Kind;
}

export function isUnionType(obj: any): obj is UnionType {
  return obj && typeof obj === 'object' && obj.kind === UnionType.Kind;
}

export function isHttpController(obj: any): obj is HttpController {
  return obj && typeof obj === 'object' && obj.kind === HttpController.Kind;
}
