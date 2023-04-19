import { SpecVersion as _SpecVersion } from './constants.js';
import { ComplexType as _ComplexType } from './data-type/complex-type.interface.js'
import { DataType as _DataType, DataTypeBase as _DataTypeBase } from './data-type/data-type.interface.js'
import {
  EnumArray as _EnumArray,
  EnumObject as _EnumObject,
  EnumThunk as _EnumThunk,
  EnumType as _EnumType
} from './data-type/enum-type.interface.js'
import { Field as _Field } from './data-type/field.interface.js';
import { MappedType as _MappedType } from './data-type/mapped-type.interface.js'
import { SimpleType as _SimpleType } from './data-type/simple-type.interface.js'
import { UnionType as _UnionType } from './data-type/union-type.interface.js'
import {
  ApiDocument as _ApiDocument,
  ContactPerson as _ContactPerson,
  DocumentInfo as _DocumentInfo,
  LicenseInfo as _LicenseInfo,
  ServerInfo as _ServerInfo
} from './document.interface.js';
import { Collection as _Collection } from './resource/collection.interface.js';
import { Container as _Container } from './resource/container.interface.js';
import { Endpoint as _Endpoint } from './resource/endpoint.interface.js';
import { Resource as _Resource, ResourceBase as _ResourceBase } from './resource/resource.interface.js';
import { Singleton as _Singleton } from './resource/singleton.interface.js';
import {
  isCollection as _isCollection,
  isComplexType as _isComplexType,
  isContainer as _isContainer,
  isDataType as _isDataType,
  isEnumType as _isEnumType,
  isMappedType as _isMappedType,
  isResource as _isResource,
  isSimpleType as _isSimpleType,
  isSingleton as _isSingleton,
  isUnionType as _isUnionType
} from './type-guards.js';

export namespace OpraSchema {

  // Re-export constants and types
  export const SpecVersion = _SpecVersion;
  export type SpecVersion = _SpecVersion;

  export type EnumObject = _EnumObject;
  export type EnumArray = _EnumArray;
  export type EnumThunk = _EnumThunk;
  export type ApiDocument = _ApiDocument;
  export type ContactPerson = _ContactPerson;
  export type ServerInfo = _ServerInfo;
  export type LicenseInfo = _LicenseInfo;
  export type DocumentInfo = _DocumentInfo;
  export type DataTypeBase = _DataTypeBase;
  export type ResourceBase = _ResourceBase;

  // Re-export namespaces
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import DataType = _DataType;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import ComplexType = _ComplexType;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Field = _Field;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import EnumType = _EnumType;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import MappedType = _MappedType;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import SimpleType = _SimpleType;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import UnionType = _UnionType;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Resource = _Resource;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Collection = _Collection;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Container = _Container;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Singleton = _Singleton;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Endpoint = _Endpoint;

  export const isDataType = _isDataType;
  export const isComplexType = _isComplexType;
  export const isEnumType = _isEnumType;
  export const isMappedType = _isMappedType;
  export const isSimpleType = _isSimpleType;
  export const isUnionType = _isUnionType;
  export const isResource = _isResource;
  export const isCollection = _isCollection;
  export const isContainer = _isContainer;
  export const isSingleton = _isSingleton;

}
