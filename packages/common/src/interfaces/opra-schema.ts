import { Type } from 'ts-gems';

export namespace OpraSchema {

  //#region # Common
  export type Extensible<T = any> = { [key: `$${string}`]: T };
  export type ResourceKind =
      'ContainerResource' |
      'EntityResource' |
      'SingletonResource';
  export type DataTypeKind = 'SimpleType' | 'ComplexType';

  //#endregion Common

  export interface Service extends Document {
    resources: Resource[];
    servers?: ServerInfo[];
  }

  //#region # Service Document specific types
  export interface Document {
    version: string; // Spec version = 1.0
    info: DocumentInfo;
    references?: Record<string, Reference>;
    types: DataType[];
  }

  export type ServerInfo = Extensible & {
    url: string;
    description?: string;
  }

  export type DocumentInfo = Extensible & {
    title: string;
    version: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactPerson[];
    license?: LicenseInfo;
  }

  export type ContactPerson = Extensible & {
    name?: string;
    email?: string;
    url?: string;
  }

  export type LicenseInfo = Extensible & {
    name: string;
    url?: string;
    content?: string;
  }

  export type Reference = Extensible & {
    url?: string;
    document?: Document;
  }

  //#endregion


  //#region # DataType
  export type DataType = SimpleType | ComplexType;

  export type BaseDataType = {
    kind: DataTypeKind;
    name: string;
    description?: string;
    base?: string;
  }

  export interface SimpleType extends BaseDataType {
    kind: 'SimpleType';
    type: 'boolean' | 'number' | 'integer' | 'string';
    format?: string;
    default?: boolean | number | string;
    enum?: string[] | Record<string, string>;
    enumDescriptions?: Record<string, string>;
  }

  export interface ComplexType extends BaseDataType {
    kind: 'ComplexType';
    name: string;
    ctor?: Type;
    description?: string;
    abstract?: boolean;
    properties?: Record<string, Property>;
    additionalProperties?: boolean | string | Pick<Property, 'type' | 'format' | 'isArray' | 'enum'>;
  }

  export type Property = Extensible & {
    name: string;
    type?: string;
    description?: string;
    isArray?: boolean;
    format?: string;
    default?: any;
    fixed?: string | number;
    enum?: string | string[] | Record<string, string>;
    examples?: any[] | Record<string, any>;
    deprecated?: boolean | string;

    /**
     * If true, this property will not be included in results by default.
     * The client side should include the property name in the "include" query parameter.
     */
    exclusive?: boolean;

    // rules
    nullable?: boolean;
    readOnly?: boolean;
    writeOnly?: boolean;
    required?: boolean;
  }


  export function isDataType(obj: any): obj is ComplexType {
    return obj && typeof obj === 'object' &&
        (obj.kind === 'SimpleType' || obj.kind === 'ComplexType');
  }

  export function isComplexType(obj: any): obj is ComplexType {
    return obj && typeof obj === 'object' &&
        (obj.kind === 'ComplexType' || obj.kind === 'EntityType');
  }

  export function isSimpleType(obj: any): obj is SimpleType {
    return obj && typeof obj === 'object' && obj.kind === 'SimpleType';
  }

  //#endregion DataType


  //#region # Resources
  export type Resource = ContainerResource | EntityResource | SingletonResource;

  export interface BaseResource {
    kind: ResourceKind;
    name: string;
    description?: string;
  }

  export interface EntityResource extends BaseResource {
    kind: 'EntityResource',
    type: string;
    primaryKey: string | string[];
    create?: ResourceReadOperation;
    search?: ResourceSearchOperation;
    read?: ResourceReadOperation;
    update?: ResourceReadOperation;
    // updateMany?: ResourceReadOperation;
    patch?: ResourceReadOperation;
    // patchMany?: ResourceReadOperation;
    delete?: ResourceReadOperation;
    // deleteMany: ResourceReadOperation;
  }

  export interface SingletonResource extends BaseResource {
    kind: 'SingletonResource',
    read?: ResourceOperation;
  }

  export interface ContainerResource extends BaseResource {
    kind: 'ContainerResource',
    resources: Resource[];
  }

  //#region # Operations

  export type ResourceOperation = Extensible & {
    handler?: Function;
  }

  export type ResourceReadOperation = ResourceOperation & {
  }

  export type ResourceSearchOperation = ResourceOperation & {
    defaultLimit?: number;
    maxLimit?: number;
    sortPaths?: string[];
    defaultSortPaths?: string[];
  }

  export type ResourceCreateOperation = ResourceOperation & {
  }

  export type ResourceUpdateOperation = ResourceOperation & {
  }

  export type ResourcePatchOperation = ResourceOperation & {
  }

  export type ResourceDeleteOperation = ResourceOperation & {
  }

  export type ResourceExecuteOperation = ResourceOperation & {
  }


  export function isResource(obj: any): obj is Resource {
    return obj && typeof obj === 'object' &&
        obj.kind === 'ContainerResource' ||
        obj.kind === 'EntityResource' ||
        obj.kind === 'SingletonResource';
  }

  export function isEntityResource(obj: any): obj is EntityResource {
    return obj && typeof obj === 'object' && obj.kind === 'EntityResource';
  }

  export function isSingletonResource(obj: any): obj is EntityResource {
    return obj && typeof obj === 'object' && obj.kind === 'SingletonResource';
  }

  export function isContainerResource(obj: any): obj is ContainerResource {
    return obj && typeof obj === 'object' && obj.kind === 'ContainerResource';
  }


  //#endregion Operations
  //#endregion Resources

}
