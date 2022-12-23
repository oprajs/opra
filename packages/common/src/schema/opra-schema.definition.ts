import { Type } from 'ts-gems';
import { ComparisonOperator } from '../filter/index.js';

export namespace OpraSchema {

  /**
   * *** === Constants === ***
   */

  export const Version = '1.0';

  /**
   * *** === Type definitions === ***
   */

  export type Extensible<T = any> = { [key: `$${string}`]: T };
  export type ResourceKind = 'ContainerResource' | 'CollectionResource' | 'SingletonResource';
  export type DataTypeKind = 'SimpleType' | 'ComplexType' | 'UnionType';
  export type SingletonMethod = 'get' | 'create' | 'update' | 'delete';
  export type CollectionMethod = SingletonMethod | 'search' | 'count' | 'updateMany' | 'deleteMany';

  /**
   * *** === Document related === ***
   */

  export interface Document {
    version: string; // Spec version = 1.0
    info: DocumentInfo;
    references?: Record<string, Reference>;
    types?: Record<string, DataType>;
    resources?: Record<string, Resource>;
    servers?: ServerInfo[];
  }

  export type ServerInfo = Extensible & {
    url: string;
    description?: string;
  }

  export type Reference = Extensible & {
    url?: string;
    document?: Document;
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

  /**
   * *** === Data Type related === ***
   */

  export type DataType = ComplexType | SimpleType | UnionType;

  export type BaseDataType = {
    kind: DataTypeKind;
    // name: string;
    description?: string;
    ctor?: Type;
    parse?: (v: any) => any;
    serialize?: (v: any) => any;
  }

  export interface SimpleType extends BaseDataType {
    kind: 'SimpleType';
  }

  export interface UnionType extends BaseDataType {
    kind: 'UnionType';
    types: DataType[];
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
    type: string;
    pick?: string[];
    omit?: string[];
  }

  export type Field = Extensible & {
    type: string;
    description?: string;
    required?: boolean;
    isArray?: boolean;
    format?: string;
    default?: any;
    fixed?: string | number;
    enum?: string | string[] | Record<string, string>;
    enumName?: string;
    examples?: any[] | Record<string, any>;
    deprecated?: boolean | string;

    /**
     * If true, this property will not be included in results by default.
     * The client side should include the property name in the "include" query parameter.
     */
    exclusive?: boolean;

    // rules
    // nullable?: boolean;
    // readOnly?: boolean;
    // writeOnly?: boolean;
    // required?: boolean;
  }


  /**
   * *** === Resource related === ***
   */

  export type Resource = ContainerResource | CollectionResource | SingletonResource;

  export interface BaseResource {
    kind: ResourceKind;
    // name: string;
    description?: string;
    instance?: {};
  }

  export interface CollectionResource extends BaseResource {
    kind: 'CollectionResource',
    type: string;
    keyFields: string | string[];
    create?: CreateMethodResolver;
    count?: CountMethodResolver;
    delete?: DeleteMethodResolver;
    deleteMany?: DeleteManyMethodResolver;
    get?: GetMethodResolver;
    update?: UpdateMethodResolver;
    updateMany?: UpdateManyMethodResolver;
    search?: SearchMethodResolver;
  }

  export interface SingletonResource extends BaseResource {
    kind: 'SingletonResource',
    type: string;
    create?: CreateMethodResolver;
    get?: GetMethodResolver;
    update?: UpdateMethodResolver;
    delete?: DeleteMethodResolver;
  }

  export interface ContainerResource extends BaseResource {
    kind: 'ContainerResource',
    resources: Resource[];
  }

  export type MethodResolver = {
    handler?: Function;
  }

  type MethodResolverInputOptions = {
    inputPick?: string[];
    inputOmit?: string[];
  }

  type MethodResolverOutputOptions = {
    outputPick?: string[];
    outputOmit?: string[];
  }

  type MethodResolverFilterOptions = {
    filters?: { field: string, operators?: ComparisonOperator[] }[]
  }

  export type CreateMethodResolver = MethodResolver & MethodResolverInputOptions & MethodResolverOutputOptions;
  export type CountMethodResolver = MethodResolver & {};
  export type DeleteMethodResolver = MethodResolver & {};
  export type DeleteManyMethodResolver = MethodResolver & MethodResolverFilterOptions;
  export type GetMethodResolver = MethodResolver & MethodResolverOutputOptions;
  export type UpdateMethodResolver = MethodResolver & MethodResolverInputOptions & MethodResolverOutputOptions;
  export type UpdateManyMethodResolver = MethodResolver & MethodResolverFilterOptions;
  export type SearchMethodResolver = MethodResolver & MethodResolverOutputOptions & {
    sortFields?: string[];
    defaultSort?: string[];
  } & MethodResolverFilterOptions;

  /**
   * *** === Type Guards === ***
   */

  export function isDataType(obj: any): obj is DataType {
    return obj && typeof obj === 'object' &&
        (obj.kind === 'ComplexType' || obj.kind === 'SimpleType' || obj.kind === 'UnionType');
  }

  export function isComplexType(obj: any): obj is ComplexType {
    return obj && typeof obj === 'object' && obj.kind === 'ComplexType';
  }

  export function isSimpleType(obj: any): obj is SimpleType {
    return obj && typeof obj === 'object' && obj.kind === 'SimpleType';
  }

  export function isUnionTypee(obj: any): obj is UnionType {
    return obj && typeof obj === 'object' && obj.kind === 'UnionType';
  }

  export function isResource(obj: any): obj is Resource {
    return obj && typeof obj === 'object' &&
        obj.kind === 'ContainerResource' ||
        obj.kind === 'CollectionResource' ||
        obj.kind === 'SingletonResource';
  }

  export function isCollectionResource(obj: any): obj is CollectionResource {
    return obj && typeof obj === 'object' && obj.kind === 'CollectionResource';
  }

  export function isSingletonResource(obj: any): obj is SingletonResource {
    return obj && typeof obj === 'object' && obj.kind === 'SingletonResource';
  }

  export function isContainerResource(obj: any): obj is ContainerResource {
    return obj && typeof obj === 'object' && obj.kind === 'ContainerResource';
  }

}
