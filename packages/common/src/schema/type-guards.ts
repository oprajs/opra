import { ComplexType } from './data-type/complex-type.interface.js';
import { DataType } from './data-type/data-type.interface.js';
import { EnumType } from './data-type/enum-type.interface.js';
import { MappedType } from './data-type/mapped-type.interface.js';
import { SimpleType } from './data-type/simple-type.interface.js';
import { UnionType } from './data-type/union-type.interface.js';
import { Collection } from './source/collection.interface.js';
import { Container } from './source/container.interface.js';
import { Singleton } from './source/singleton.interface.js';
import { Source } from './source/source.interface.js';
import { Storage } from './source/storage.interface.js';

export function isDataType(obj: any): obj is DataType {
  return obj && typeof obj === 'object' &&
      (obj.kind === ComplexType.Kind ||
          obj.kind === EnumType.Kind ||
          obj.kind === MappedType.Kind ||
          obj.kind === SimpleType.Kind ||
          obj.kind === UnionType.Kind
      );
}

export function isComplexType(obj: any): obj is ComplexType {
  return obj && typeof obj === 'object' && obj.kind === ComplexType.Kind;
}

export function isSimpleType(obj: any): obj is SimpleType {
  return obj && typeof obj === 'object' && obj.kind === SimpleType.Kind;
}

export function isUnionType(obj: any): obj is UnionType {
  return obj && typeof obj === 'object' && obj.kind === UnionType.Kind;
}

export function isMappedType(obj: any): obj is MappedType {
  return obj && typeof obj === 'object' && obj.kind === MappedType.Kind;
}

export function isEnumType(obj: any): obj is EnumType {
  return obj && typeof obj === 'object' && obj.kind === EnumType.Kind;
}

export function isSource(obj: any): obj is Source {
  return obj && typeof obj === 'object' &&
      (obj.kind === Container.Kind ||
          obj.kind === Collection.Kind ||
          obj.kind === Singleton.Kind);
}

export function isCollection(obj: any): obj is Collection {
  return obj && typeof obj === 'object' && obj.kind === Collection.Kind;
}

export function isSingleton(obj: any): obj is Singleton {
  return obj && typeof obj === 'object' && obj.kind === Singleton.Kind;
}

export function isStorage(obj: any): obj is Singleton {
  return obj && typeof obj === 'object' && obj.kind === Storage.Kind;
}

export function isContainer(obj: any): obj is Container {
  return obj && typeof obj === 'object' && obj.kind === Container.Kind;
}
