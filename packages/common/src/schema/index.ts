import * as ApiDocument_ from './api-document.interface.js';
import * as constants_ from './constants.js';
import * as ComplexType_ from './data-type/complex-type.interface.js';
import * as DataType_ from './data-type/data-type.interface.js';
import * as EnumType_ from './data-type/enum-type.interface.js';
import * as Field_ from './data-type/field.interface.js';
import * as MappedType_ from './data-type/mapped-type.interface.js';
import * as MixinType_ from './data-type/mixin-type.interface.js';
import * as SimpleType_ from './data-type/simple-type.interface.js';
import * as Http_ from './http.js';
import * as TypeGuards_ from './type-guards.js';
import * as TypeScope_ from './type-scope.interface.js';

export namespace OpraSchema {
  export import SpecVersion = constants_.SpecVersion;
  export import Protocol = ApiDocument_.Protocol;

  export import ApiDocument = ApiDocument_.ApiDocument;
  export import DocumentInfo = ApiDocument_.DocumentInfo;
  export import ContactPerson = ApiDocument_.ContactPerson;
  export import LicenseInfo = ApiDocument_.LicenseInfo;
  export import Service = ApiDocument_.Service;

  export import ComplexType = ComplexType_.ComplexType;
  export import DataType = DataType_.DataType;
  export import EnumType = EnumType_.EnumType;
  export import Field = Field_.Field;
  export import MappedType = MappedType_.MappedType;
  export import MixinType = MixinType_.MixinType;
  export import SimpleType = SimpleType_.SimpleType;

  export import DocumentElement = TypeScope_.DocumentElement;

  export import Http = Http_.Http;

  export import isComplexType = TypeGuards_.isComplexType;
  export import isDataType = TypeGuards_.isDataType;
  export import isSimpleType = TypeGuards_.isSimpleType;
  export import isMixinType = TypeGuards_.isMixinType;
  export import isMappedType = TypeGuards_.isMappedType;
  export import isEnumType = TypeGuards_.isEnumType;
  export import isResource = TypeGuards_.isHttpResource;
}


