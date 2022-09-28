import { StrictOmit, Type } from 'ts-gems';

export namespace OpraSchema {

  export const Version = '1.0';

  //#region # Common
  export type Extensible<T = any> = { [key: `$${string}`]: T };

  export type ResourceKind =
      'ContainerResource' |
      'EntityResource' |
      'SingletonResource';
  export type DataTypeKind = 'SimpleType' | 'ComplexType' | 'EntityType';
  export type OperationType = 'create' | 'read' | 'update' | 'patch' | 'delete' | 'execute';
  export type QueryScope = 'collection' | 'instance' | 'property';
  export type EntityMethodType = 'search' | 'get' | 'create' | 'update' | 'updateMany' | 'delete' | 'deleteMany';

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
  export type DataType = ComplexType | EntityType | SimpleType;

  export type BaseDataType = {
    kind: DataTypeKind;
    name: string;
    description?: string;
    ctor?: Type;
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
    description?: string;
    abstract?: boolean;
    extends?: ComplexTypeExtendingInfo[];
    fields?: Record<string, Field>;
    additionalFields?: boolean | string | Pick<Field, 'type' | 'format' | 'isArray' | 'enum'>;
  }

  export interface ComplexTypeExtendingInfo {
    type: 'string';
    pick?: string[];
    omit?: string[];
  }

  export interface EntityType extends StrictOmit<ComplexType, 'kind'> {
    kind: 'EntityType';
    primaryKey: string;
  }

  export type Field = Extensible & {
    type: string;
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

  export function isDataType(obj: any): obj is DataType {
    return obj && typeof obj === 'object' &&
        (obj.kind === 'ComplexType' || obj.kind === 'EntityType' || obj.kind === 'SimpleType');
  }

  export function isComplexType(obj: any): obj is ComplexType {
    return obj && typeof obj === 'object' && obj.kind === 'ComplexType';
  }

  export function isEntityType(obj: any): obj is EntityType {
    return obj && typeof obj === 'object' && obj.kind === 'EntityType'
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
    methods: Partial<Record<EntityMethodType, true | MethodResolver>>;
  }

  export type MethodResolver = {
    handler?: Function;
  }

  export interface SingletonResource extends BaseResource {
    kind: 'SingletonResource',
    type: string;
  }

  export interface ContainerResource extends BaseResource {
    kind: 'ContainerResource',
    resources: Resource[];
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
