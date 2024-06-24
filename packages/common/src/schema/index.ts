import * as constants_ from './constants.js';
import * as complexType_ from './data-type/complex-type.interface.js';
import * as dataType_ from './data-type/data-type.interface.js';
import * as enumType_ from './data-type/enum-type.interface.js';
import * as field_ from './data-type/field.interface.js';
import * as mappedType_ from './data-type/mapped-type.interface.js';
import * as mixinType_ from './data-type/mixin-type.interface.js';
import * as simpleType_ from './data-type/simple-type.interface.js';
import * as dataTypeContainer_ from './data-type-container.interface.js';
import * as apiDocument_ from './document.interface.js';
import * as controller_ from './http/http-controller.interface.js';
import * as mediaType_ from './http/http-media-type.interface.js';
import * as multipartField_ from './http/http-multipart-field.interface.js';
import * as operation_ from './http/http-operation.interface.js';
import * as response_ from './http/http-operation-response.interface.js';
import * as parameter_ from './http/http-parameter.interface.js';
import * as requestBody_ from './http/http-request-body.interface.js';
import * as httpStatusRange_ from './http/http-status-range.interface.js';
import * as typeGuards_ from './type-guards.js';
import * as types_ from './types.js';
import * as value_ from './value.interface.js';

export namespace OpraSchema {
  export import SpecVersion = constants_.SpecVersion;
  export import Protocol = apiDocument_.Protocol;

  export import ApiDocument = apiDocument_.Document;
  export import DocumentInfo = apiDocument_.DocumentInfo;
  export import ContactPerson = apiDocument_.ContactPerson;
  export import LicenseInfo = apiDocument_.LicenseInfo;
  export import DocumentReference = apiDocument_.DocumentReference;
  export import HttpApi = apiDocument_.HttpApi;
  export import Api = apiDocument_.Api;
  export import HttpMethod = types_.HttpMethod;
  export import HttpParameterLocation = types_.HttpParameterLocation;
  export import HttpMultipartFieldType = types_.HttpMultipartFieldType;
  export import Value = value_.Value;

  export import ComplexType = complexType_.ComplexType;
  export import DataType = dataType_.DataType;
  export import DataTypeBase = dataType_.DataTypeBase;
  export import DataTypeExample = dataType_.DataTypeExample;
  export import EnumType = enumType_.EnumType;
  export import Field = field_.Field;
  export import MappedType = mappedType_.MappedType;
  export import MixinType = mixinType_.MixinType;
  export import SimpleType = simpleType_.SimpleType;
  export import Attribute = simpleType_.Attribute;

  export import DataTypeContainer = dataTypeContainer_.DataTypeContainer;

  export import HttpController = controller_.HttpController;
  export import HttpMediaType = mediaType_.HttpMediaType;
  export import HttpMultipartField = multipartField_.HttpMultipartField;
  export import HttpOperation = operation_.HttpOperation;
  export import HttpParameter = parameter_.HttpParameter;
  export import HttpRequestBody = requestBody_.HttpRequestBody;
  export import HttpStatusRange = httpStatusRange_.HttpStatusRange;
  export import HttpOperationResponse = response_.HttpOperationResponse;

  export import isComplexType = typeGuards_.isComplexType;
  export import isDataType = typeGuards_.isDataType;
  export import isSimpleType = typeGuards_.isSimpleType;
  export import isMixinType = typeGuards_.isMixinType;
  export import isMappedType = typeGuards_.isMappedType;
  export import isEnumType = typeGuards_.isEnumType;
  export import isHttpController = typeGuards_.isHttpController;
}
